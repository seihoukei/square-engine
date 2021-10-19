import Geometry from "./geometry.js"

// noinspection JSUnusedGlobalSymbols
export default class Region {
    static DEFAULT_REGION = {}
    
    constructor (data) {
        return Object.assign(this, Region.DEFAULT_REGION, data)
    }

    *[Symbol.iterator] () {
        let edge = this.start
        if (edge) {
            yield edge
            while (edge.next && edge.next !== this.start) {
                edge = edge.next
                yield edge
            }
        }
    }

    *renderCoordinates() {
        let edge = this.start
        if (!edge)
            return
        yield {
            first : true,
            x : edge.cappedStartX ,
            y : edge.cappedStartY ,
        }
        yield {
            x : edge.cappedEndX,
            y : edge.cappedEndY,
        }
        while (edge.next && edge.next !== this.start) {
            edge = edge.next
            yield {
                x : edge.cappedEndX,
                y : edge.cappedEndY,
            }
        }
    }

    *renderEdges(shift = 0) {
        for (let edge of this) {
            yield {
                sx : edge.cappedStartX + shift * edge.dy,
                sy : edge.cappedStartY - shift * edge.dx,
                ex : edge.cappedEndX + shift * edge.dy,
                ey : edge.cappedEndY - shift * edge.dx,
            }
        }
    }

    intersectEdge(edge, cutEdge = true, cutRegion = false) {
        let result = new Array(2)
        for (let other of this) {
            if (edge.intersectEdge(other, true)) {
                if (edge.dx * other.dy > edge.dy * other.dx) {
                    result[0] = other
                    if (cutEdge)
                        edge.end = edge.intersection
                    if (cutRegion)
                        other.start = other.intersection
                    if (result[1])
                        break
                } else {
                    result[1] = other
                    if (cutEdge)
                        edge.start = edge.intersection
                    if (cutRegion)
                        other.end = other.intersection
                    if (result[0])
                        break
                }
            }
        }
        if (result[0] === undefined && result[1] === undefined)
            return false
        return result
    }

    normalize() {
        for (let edge of this)
            edge.normalize()
    }

    add(edge) {
        if (!this.start) {
            this.start = edge
            return true
        }
        return this.cutWith(edge)
    }

    addBefore(before, edge, updateStart = true) {
        if (before === undefined)
            return false
        delete before.last?.next
        edge.next = before
        edge.next.last = edge

        if (updateStart)
            this.setStart(edge)
    }

    addAfter(after, edge, updateStart = true) {
        if (after === undefined)
            return false
        delete after.next?.last
        edge.last = after
        edge.last.next = edge

        if (this.start.last && updateStart)
            this.setStart(edge)
    }

    addBetween(after, before, edge) {
        if (after === undefined)
            return this.addBefore(before, edge)
        if (before === undefined)
            return this.addAfter(after, edge)
        const cut = !(after.next === before)

        if (cut) {
            delete after.next?.last
            delete before.last?.next
        }

        edge.last = after
        edge.next = before
        edge.last.next = edge
        edge.next.last = edge

        if (cut)
            this.setStart(edge)
    }

    cutWith(edge) {
        const intersections = this.intersectEdge(edge, true, true)
        if (!intersections)
            return false
        this.addBetween(intersections[1], intersections[0], edge)
        return true
    }

    crop(removeNegative = true) {
        if (!this.start)
            return
        this.start.start = -Infinity
        for (let edge of this) {
            const other = edge.next
            if (!other) {
                edge.end = Infinity
                continue
            }
            if (edge.intersectEdge(other)) {
                edge.end = edge.intersection
                other.start = other.intersection
            }
        }
        if (!removeNegative)
            return

        let fixed = false
        for (let edge of [...this]) {
            if (edge.start > edge.end) {
                this.remove(edge, edge.next && edge.last)
                fixed = true
            }
        }
        if (fixed)
            this.crop(removeNegative)
    }

    fixHoles(circle) {
        for (let edge of this) {
            const other = edge.next
            if (!other)
                continue

            const Sx = other.startX
            const Sy = other.startY
            const Ex = edge.endX
            const Ey = edge.endY

            const ESx = Sx - Ex
            const ESy = Sy - Ey

            if (Math.abs(ESx) + Math.abs(ESy) < Geometry.PRECISION)
                continue

            const ES = Math.hypot(ESx, ESy)
            if (circle) {
                const OPx = edge.site.x - circle.x
                const OPy = edge.site.y - circle.y

                const OSx = Sx - circle.x
                const OSy = Sy - circle.y

                const OEx = Ex - circle.x
                const OEy = Ey - circle.y

                if (Math.sign(OPx * OSy - OPy * OSx ) !== Math.sign(OPx * OEy - OPy * OEx)) {
                    const OP = Math.hypot(OPx, OPy)
                    let dOPx = OPx / OP
                    let dOPy = OPy / OP
                    if (dOPx * ESy - dOPy * ESx < 0) {
                        dOPx = -dOPx
                        dOPy = -dOPy
                    }

                    const OT = (OP + circle.radius) / 2
                    const OTx = OT * dOPx
                    const OTy = OT * dOPy

                    const ETx = OTx - OEx
                    const ETy = OTy - OEy
                    const ET = Math.hypot(ETx, ETy)
                    const dETx = ETx / ET
                    const dETy = ETy / ET

                    const first = Geometry.Edge.byPointAndDirectionCoordinates(Ex, Ey, dETx, dETy, edge.site)
                    first.limit(0, ET)
                    this.addBetween(edge, other, first)

                    const TSx = OSx - OTx
                    const TSy = OSy - OTy
                    const TS = Math.hypot(TSx, TSy)
                    const dTSx = TSx / TS
                    const dTSy = TSy / TS

                    const second = Geometry.Edge.byPointAndDirectionCoordinates(Sx, Sy, dTSx, dTSy, edge.site)
                    second.limit(-TS, 0)
                    this.addBetween(first, other, second)

                    continue
                }
            }
            const fix = Geometry.Edge.byPointAndDirectionCoordinates(edge.endX, edge.endY, ESx / ES, ESy / ES, other.site === edge.site ? edge.site : undefined)
            fix.limit(0, ES)

            this.addBetween(edge, other, fix)
        }
    }

    setStart(start) {
        this.start = start

        let first = start.last
        while (first && first !== start) {
            this.start = first
            first = first.last
        }

        if (first)
            this.start = start
    }

    remove(edge, continuous = false) { //slightly borked :<
        if (edge.next === edge.last) {
            if (continuous) {
                delete this.start
                return
            }
            delete edge.next?.last
            delete edge.last?.next
        } else {
            if (edge.next)
                edge.next.last = edge.last
            if (edge.last)
                edge.last.next = edge.next
        }

        if (edge === this.start)
            this.start = edge.next// ?? edge.last
    }

    shrinkBy(value) {
        for (let edge of this){
            edge.x -= edge.dy * value
            edge.y += edge.dx * value
        }

        this.crop()
    }

    shrinkByCondition(condition, ifTrue, ifFalse) {
        for (let edge of this){
            const value = condition(edge, edge.twin) ? ifTrue : ifFalse
            edge.x -= edge.dy * value
            edge.y += edge.dx * value
        }

        this.crop()
        this.fixHoles()
    }

    shrinkTo(maxDistance, vertexFactor = 1.45) {
        for (let edge of this)
            edge.limitDistanceTo(this.site, maxDistance)

        this.crop()

        let inserted = true
        let times = 5
        while (inserted && times--) {
            inserted = false
            for (let edge of [...this]) {
                if (!edge.next)
                    continue

                const site = this.site ?? edge.site
                if (!site || edge.pointSide(site.x, site.y) < 0)
                    continue

                const OEx = edge.endX - site.x
                const OEy = edge.endY - site.y
                const OE = Math.hypot(OEx, OEy)

                if (OE < maxDistance * vertexFactor + Geometry.PRECISION)
                    continue

                const dOEx = OEx / OE
                const dOEy = OEy / OE

                const fix = Geometry.Edge.byPointAndDirectionCoordinates(
                    site.x + dOEx * maxDistance,
                    site.y + dOEy * maxDistance,
                    -dOEy,
                    dOEx,
                    site,
                )

//                if (fix.pointSide(site.x, site.y) > 0)
                this.addBetween(edge, edge.next, fix)

                inserted = true
            }
            if (inserted)
                this.crop()
        }

    }

    getMassCenter() {
        if (!this.start)
            return false
        let mass = 0
        let x = 0
        let y = 0
        for (let edge of this) {
            const length = edge.length
            if (length >= Infinity)
                continue
            const distance = edge.x * edge.dy - edge.y * edge.dx
            let power = length * distance
            mass += power
            const Cx = edge.x + edge.dx * (edge.end + edge.start) / 2
            const Cy = edge.y + edge.dy * (edge.end + edge.start) / 2
            x += Cx * power * 2/3
            y += Cy * power * 2/3
        }
        if (mass === 0)
            return false

        return {
            x : x / mass,
            y : y / mass,
        }

    }

    expandBy(value, fixHoles = false) {
        for (let edge of this){
            edge.x += edge.dy * value
            edge.y -= edge.dx * value
        }

        if (value > 0 && fixHoles)
            this.fixHoles()
        else
            this.crop()
    }

    loop() {
        let last = this.start
        if (last.last)
            return

        while (last.next)
            last = last.next

        this.addBefore(this.start, last)
    }

    clear() {
        delete this.start
    }

    log() {
        const edges = [...this]
        console.log(edges.map(x => [
            edges.indexOf(x),
            edges.indexOf(x.last),
            "=>",
            x.x.toFixed(1),
            x.y.toFixed(1),
            x.dx.toFixed(3),
            x.dy.toFixed(3),
            x.start.toFixed(3),
            x.end.toFixed(3),
            x.twin?.site.index ?? -1,
            "=>",
            edges.indexOf(x.next),
        ]).sort((x,y) => x[0] - y[0]).map(x => x.join("\t")).join("\n"))
    }

    seekPoint(x, y) {
        //returns the first edge that has given point on the wrong side
        for (let edge of this) {
            if (edge.dx * (edge.y - y) > edge.dy * (edge.x - x))
                return edge
        }
        return false
    }

    contains(x, y) {
        return !this.seekPoint(x, y)
    }

    voronoiCrop(circle, fixHoles = true) {
        let edge = this.start

        //loop region
        if (edge && !edge.last) {
            this.loop()
        }


        for (let edge of [...this]) {
            const MOx = circle.x - edge.x
            const MOy = circle.y - edge.y
            const MO2 = MOx ** 2 + MOy ** 2

            const Ox = MOx * edge.dx + MOy * edge.dy
            const Oy = MOx * edge.dy - MOy * edge.dx

            const MGx = edge.site.x - edge.x
            const MGy = edge.site.y - edge.y
            const MG2 = MGx ** 2 + MGy ** 2

            const Gx = MGx * edge.dx + MGy * edge.dy
            const Gy = MGx * edge.dy - MGy * edge.dx

            const N = MO2 + MG2 - circle.radius ** 2

            const A = 4 * (Gy ** 2 + Oy ** 2 + 2 * Gx * Ox - N)
            const B = -4 * (2 * Gy ** 2 * Ox + 2 * Oy ** 2 * Gx + (2 * Gx * Ox - N) * (Ox + Gx))
            const C = 4 * MO2 * MG2 - N ** 2

            const D = B ** 2 - 4 * A * C

            if (D > 0) {
                const start = (-B - D ** 0.5) / (2 * A)
                const end = (-B + D ** 0.5) / (2 * A)

                edge.limit(Math.min(edge.end, Math.max(edge.start, start)), Math.max(edge.start, Math.min(end, edge.end)))
            }

            if (D <= 0 || edge.start === edge.end) {
                edge.next.last = edge.last
                edge.last.next = edge.next
                if (edge === this.start)
                    this.start = edge.next
                //this.remove(edge)
            }

            edge.cropped = true
        }

        //fix holes!
        if (fixHoles)
            this.fixHoles(circle)
    }
}
