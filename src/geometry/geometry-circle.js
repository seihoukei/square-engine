import Utility from "../utility/utility.js"

// noinspection JSUnusedGlobalSymbols
export default class Circle {
    static DEFAULT_CIRCLE = {
        x : 0,
        y : 0,
        radius : 0,
    }
    
    constructor (data) {
        return Object.assign(this, Circle.DEFAULT_CIRCLE, data)
    }

    static byThreePointsCoordinates(x1, y1, x2, y2, x3, y3) {
        return new this().toThreePointsCoordinates(x1, y1, x2, y2, x3, y3)
    }

    static byThreePoints(first, second, third) {
        return new this().toThreePointsCoordinates(
            first.x, first.y,
            second.x, second.y,
            third.x, third.y
        )
    }

    static enclosing(points, addRadius) {
        return new this().enclose(points, addRadius)
    }

    static byTwoPointsAndCircle(first, second, circle, selector = circle) {
        const ABx = second.x - first.x
        const ABy = second.y - first.y
        const AB = Math.hypot(ABx, ABy)
        const AM = AB / 2

        const Mx = first.x + ABx / 2
        const My = first.y + ABy / 2

        const RMx = Mx - circle.x
        const RMy = My - circle.y
        const RM2 = RMx ** 2 + RMy ** 2

        const OMx = Mx - selector.x
        const OMy = My - selector.y

        let dMDx = - ABy / AB
        let dMDy =   ABx / AB

        const OMxMD = dMDx * OMx + dMDy * OMy
        if (OMxMD < 0) {
            dMDx = -dMDx
            dMDy = -dMDy
        }

        const T = circle.radius ** 2 + AM ** 2 - RM2

        const RMxMD = RMx * dMDx + RMy * dMDy

        const A = 4 * (RMxMD ** 2 - circle.radius ** 2)
        const B = -4 * T * RMxMD
        const C = T ** 2 - 4 * circle.radius ** 2 * AM ** 2

        const d = B ** 2 - 4 * A * C

        const sd = d ** 0.5

        const l1 = (-B + sd) / (2 * A)

        return new this({
            x : Mx + dMDx * l1,
            y : My + dMDy * l1,
            radius : Math.hypot(l1, AM),
        })

    }

    toThreePointsCoordinates(x1, y1, x2, y2, x3, y3) {
        let x12 = x1 - x2
        let x13 = x1 - x3

        let y12 = y1 - y2
        let y13 = y1 - y3

        let y31 = y3 - y1
        let y21 = y2 - y1

        let x31 = x3 - x1
        let x21 = x2 - x1

        let sx13 = x1 ** 2 - x3 ** 2
        let sy13 = y1 ** 2 - y3 ** 2

        let sx21 = x2 ** 2 - x1 ** 2
        let sy21 = y2 ** 2 - y1 ** 2

        let f = ((sx13) * (x12)
            + (sy13) * (x12)
            + (sx21) * (x13)
            + (sy21) * (x13))
            / (2 * ((y31) * (x12) - (y21) * (x13)));
        let g = ((sx13) * (y12)
            + (sy13) * (y12)
            + (sx21) * (y13)
            + (sy21) * (y13))
            / (2 * ((x31) * (y12) - (x21) * (y13)));

        let c = -(x1 ** 2) - (y1 ** 2) - 2 * g * x1 - 2 * f * y1;

        let h = -g;
        let k = -f;

        let sqr_of_r = h * h + k * k - c;
        let r = (sqr_of_r) ** 0.5;

        this.x = h
        this.y = k
        this.radius = r

        return this
    }

    toThreePoints(first, second, third) {
        return this.toThreePointsCoordinates(
            first.x, first.y,
            second.x, second.y,
            third.x, third.y
        )
    }

    enclose (points, addRadius, fixedPoints = []) {
        if (fixedPoints.length === 3) {
            this.toThreePoints(...fixedPoints)
            if (addRadius) {
                this.addedRadius = Math.max(...fixedPoints.map(x => x.radius))
                this.radius += this.addedRadius
            }
            return this
        }

        if (fixedPoints.length === 0) {
            points = [...points]//points.map(x => ({x : x.x, y : x.y, radius : x.radius}))
            if (points.length === 0) {
                this.x = this.y = this.radius = 0
                return this
            }
            if (points.length === 1) {
                this.x = points[0].x
                this.y = points[0].y
                this.radius = points[0].radius
                return this
            }
            this.addedRadius = 0
        }

        if (fixedPoints.length < 2)
            Utility.shuffle(points)

        let start = 0

        const startPoints = [...fixedPoints]
        while (startPoints.length < 2)
            startPoints.push(points[start++])

        this.x = (startPoints[0].x + startPoints[1].x) / 2
        this.y = (startPoints[0].y + startPoints[1].y) / 2
        this.radius = Math.hypot(startPoints[0].x - startPoints[1].x, startPoints[0].y - startPoints[1].y) / 2

        for (let i = start; i < points.length; i++) {
            const distance = Math.hypot(points[i].x - this.x, points[i].y - this.y)

            if (distance < this.radius)
                continue
            this.enclose(points.slice(0,i), addRadius,[...fixedPoints, points[i]])
            this.radius -= this.addedRadius
        }
        this.radius += this.addedRadius
        return this
    }
}
