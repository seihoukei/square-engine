import Geometry from "./geometry.js"

// noinspection JSUnusedGlobalSymbols
export default class Diagram {
    constructor(regions) {
        this.regions = new Map(regions)
    }

    *[Symbol.iterator] () {
        for (let data of this.regions)
            yield data
    }

    for (site) {
        return this.regions.get(site)
    }

    findPointRegion(x, y) {
        let startRegion

        const regions = [...this.regions.values()]
        for (let i = 0; !startRegion?.start && regions[i]; i++) {
            startRegion = regions[i]
        }
        if (!startRegion?.start)
            return this.regions.size === 1 ? regions[0] : false //if there's a single region without borders, it's whole area

        return this.seekPoint(x, y, startRegion)
    }

    seekPoint(x, y, lastRegion) {
        const edge = lastRegion.seekPoint(x, y)
        if (!edge)
            return lastRegion

        if (!edge.twin?.site)
            return false

        const nextRegion =  this.regions.get(edge.twin.site)
        if (!nextRegion || !nextRegion.start || nextRegion._breadcrumbs)
            return false

        lastRegion._breadcrumbs = nextRegion
        const result = this.seekPoint(x, y, nextRegion)
        delete lastRegion._breadcrumbs

        return result
    }

    normalize() {
        for (let data of this.regions)
            data[1].normalize()
    }

    shrinkRegionsBy(by) {
        for (let [, region] of this) {
            region.shrinkBy(by)
        }
    }

    shrinkRegionsByConnection(disconnected, connected, connection) {
        for (let [, region] of this) {
            region.shrinkByConnection(disconnected, connected, connection)
        }
    }

    shrinkRegionsBySimilarity(disconnected, connected, similarity) {
        for (let [, region] of this) {
            region.shrinkBySimilarity(disconnected, connected, similarity)
        }
    }

    guestRegion(site) {
        if (!this.constructor.Edge)
            return false

        const result = new Geometry.Region({
            site
        })

        const startingRegion = this.findPointRegion(site.x, site.y)
        if (!startingRegion)
            return result

        const firstEdge = this.constructor.Edge(site, startingRegion.site)
        firstEdge.twin = {
            site : startingRegion.site
        }

        const firstOuts = startingRegion.intersectEdge(firstEdge)
        result.add(firstEdge)

        if (!firstOuts)
            return result

        let lastEdge = firstEdge
        let region = this.regions.get(firstOuts[1]?.twin?.site)

        while (region) {
            const edge = this.constructor.Edge(site, region.site)
            edge.twin = {
                site : region.site
            }

            result.addAfter(lastEdge, edge)
            lastEdge = edge

            const outs = region.intersectEdge(edge)
            if (!outs?.[1]?.twin?.site)
                break

            region = this.regions.get(outs[1].twin.site)
            if (region === startingRegion)
                break
        }

        if (region === startingRegion)
            return result

        lastEdge = firstEdge
        region = this.regions.get(firstOuts[0]?.twin?.site)
        while (region) {
            const edge = this.constructor.Edge(site, region.site)
            edge.twin = {
                site : region.site
            }

            result.addBefore(lastEdge, edge)
            lastEdge = edge

            const outs = region.intersectEdge(edge)
            if (!outs?.[0]?.twin?.site)
                break

            region = this.regions.get(outs[0].twin.site)
            if (region === startingRegion)
                break
        }

        return result
    }

    smooth(scale = 1, limit = 0) {
        for (let [site, region] of this) {
            let target = region.getMassCenter()
            if (!target) {
                const other = this.findPointRegion(site.x, site.y)
                const block = other?.start?.site ?? other?.site
                if (block) {
                    target = {
                        x: 2 * site.x - block.x,
                        y: 2 * site.y - block.y
                    }
                } else {
                    target = {
                        x: 0,
                        y: 0,
                    }
                }
            }
            const dx = target.x - site.x
            const dy = target.y - site.y
            if (!limit) {
                site.x += dx * scale
                site.y += dy * scale
                continue
            }
            const speed = scale / Math.hypot(dx, dy)
            if (speed) {
                const realSpeed = Math.min(limit, speed)
                site.x += dx * realSpeed// * 0.01
                site.y += dy * realSpeed//* 0.01
            }
        }
    }
}
