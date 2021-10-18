import Geometry from "./geometry.js"

// noinspection JSUnusedGlobalSymbols
export default class Edge {
    static DEFAULT_EDGE = {
        x : 0,
        y : 0,
        dx: 1,
        dy: 0,
        start: -Infinity,
        end : Infinity,
    }
    
    constructor (data) {
        return Object.assign(this, Edge.DEFAULT_EDGE, data)
    }

    makeTwin(site) {
        this.twin = new this.constructor({
            x : this.x,
            y : this.y,
            dx : -this.dx,
            dy : -this.dy,
            start: -this.end,
            end : -this.start,
            twin : this,
            site,
        })
        return this.twin
    }

    clone(site = this.site) {
        return new this.constructor({
            x: this.x,
            y: this.y,
            dx: this.dx,
            dy: this.dy,
            start: this.start,
            end: this.end,
            site
        })
    }

    normalize() {
        if (this.start > -Infinity) {
            this.x += this.start * this.dx
            this.y += this.start * this.dy
            this.end -= this.start
            this.start = 0
            return this
        }
        if (this.end < Infinity) {
            this.x += this.end * this.dx
            this.y += this.end * this.dy
            this.start -= this.end
            this.end = 0
            return this
        }
    }

    get length() {
        return this.end - this.start
    }

    get endX() {
        return this.x + this.dx * this.end
    }
    
    get endY() {
        return this.y + this.dy * this.end
    }
    
    get startX() {
        return this.x + this.dx * this.start
    }
    
    get startY() {
        return this.y + this.dy * this.start
    }
    
    get intersectionX() {
        return this.x + this.dx * this.intersection
    }
    
    get intersectionY() {
        return this.y + this.dy * this.intersection
    }

    get cappedStart() {
        return Math.clamp(-Geometry.CAP_INFINITY, this.start, Geometry.CAP_INFINITY)
    }

    get cappedEnd() {
        return Math.clamp(-Geometry.CAP_INFINITY, this.end, Geometry.CAP_INFINITY)
    }

    get cappedStartX() {
        return this.x + this.dx * this.cappedStart
    }

    get cappedStartY() {
        return this.y + this.dy * this.cappedStart
    }

    get cappedEndX() {
        return this.x + this.dx * this.cappedEnd
    }

    get cappedEndY() {
        return this.y + this.dy * this.cappedEnd
    }

    get cappedArrowEndX() {
        return this.x + this.dx * this.cappedEnd + this.dy * 20 - this.dx * 20
    }

    get cappedArrowEndY() {
        return this.y + this.dy * this.cappedEnd - this.dx * 20 - this.dy * 20
    }

    static byPointAndDirectionCoordinates(x, y, dx, dy, site) {
        return new this({
          x, y, dx, dy, site
        })
    }

    static byPointAndAngle(point, angle, site) {
        const dx = Math.cos(angle)
        const dy = Math.sin(angle)
        return new this({
            x : point.x, y : point.y,
            dx, dy, site
        })
    }

    static byTwoPoints(start, end, capped, site) {
        const ABx = end.x - start.x
        const ABy = end.y - start.y
        const AB = Math.hypot(ABx, ABy)
        return new this({
            x : start.x,
            y : start.y,
            dx : ABx / AB,
            dy : ABy / AB,
            start : capped ? 0 : -Infinity,
            end : capped ? AB : Infinity,
            site
        })
    }

    limit (start, end, limitTwin = false) {
        if (start !== undefined) {
            this.start = start
            if (this.twin && limitTwin)
                this.twin.end = -start
        }
        if (end !== undefined) {
            this.end = end
            if (this.twin && limitTwin)
                this.twin.start = -end
        }
    }

    limitDistanceTo(site = this.site, maxDistance = 0) {
        if (!site) return
        const distance = (this.x - site.x) * this.dy - (this.y - site.y) * this.dx
        if (distance > maxDistance) {
            const shift = distance - maxDistance
            this.x -= this.dy * shift
            this.y += this.dx * shift
        }

    }

    pointSide(x, y) {
        return this.dx * (y - this.y) - this.dy * (x - this.x)
    }

    intersectEdge(edge, capped = false) {
        const dADxBD = this.dx * edge.dy - this.dy * edge.dx

        //very parallel lines
        if (dADxBD === 0)
            return false

        const here = ((edge.x - this.x) * edge.dy - (edge.y - this.y) * edge.dx) / dADxBD

        if (capped && (here <= this.start + Geometry.PRECISION || here > this.end - Geometry.PRECISION))
            return false

        const there = (this.y - edge.y + here * this.dy) / edge.dy

        if (capped && (there <= edge.start + Geometry.PRECISION || there > edge.end - Geometry.PRECISION))
            return false

        this.intersection = here
        edge.intersection = there

        return true
    }

    getDistanceBeyondCircle(circle, forward = true, distance = 0) {
        const MOx = circle.x - this.x
        const MOy = circle.y - this.y

        if (Math.abs(MOx * this.dy - MOy * this.dx) > circle.radius + distance)
            return 0

        const MH = (MOx * this.dx + MOy * this.dy)
        const HR = circle.radius + distance

        if (forward)
            return MH + HR
        else
            return MH - HR
    }

    getDistanceBeyondEdge(edge, forward = true, distance = 0) {
        if (!forward)
            distance = -distance

        const MAx = edge.startX - this.x
        const MAy = edge.startY - this.y
        const MBx = edge.endX - this.x
        const MBy = edge.endY - this.y
        const ABx = MBx - MAx
        const ABy = MBy - MAy

        let l, h
        if (ABx === 0) {
            l = MAx / this.dx
            h = MAx
        } else {
            h = Math.abs(MAx * edge.dy - MAy * edge.dx)
            if (h === 0) {
                return 0
            }
            const T = edge.dy / edge.dx
            l = (T * MAx - MAy) / (T * this.dx - this.dy)
        }

        const r = l * (h + distance) / h

        //intersection check
        const dX = this.dx * r * ABx + this.dy * r * ABy
        if ((MAx * ABx + MAy * ABy < dX) === (MBx * ABx + MBy * ABy > dX))
            return r
        return 0
    }
}
