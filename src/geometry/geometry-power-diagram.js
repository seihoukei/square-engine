import SortedArray from "../utility/sorted-array.js"
import Geometry from "./geometry.js"
import Diagram from "./geometry-diagram.js"


function buildPowerDiagram (sites, power = "radius") {
    //function uses method of virtually growing weight of one node
    //and creating edges following corners of its power region (referred to as "the shore")
    //as it grows to cover whole diagram

    //for every node, we define distance to its power edge with starting node
    //as function D(R) = A + B * R**2
    //this allows us to predict at which weight next edge is gonna be added to the shore
    //and prediction should only be updated for the set of rays between affected edges

    //all event distances are stored squared (R**2)

    function getStartSite() {
        //rightmost site is used because it's guaranteed to have a region
        //in resulting diagram, and we need that region as starting shore line
        return sites.reduce((result, site) => site.x > result.x ? site : result)
    }

    function prepareRays() {
        //prepare list of rays towards each site
        //sorted clockwise (by dy because we use rightmost point as reference)
        //and selects starting shore rays among them
        const rays = []
        for (let site of sites) {
            const region = new Geometry.Region({
                site
            })
            regions.set(site, region)

            if (site === startSite)
                continue

            const x = site.x - startSite.x
            const y = site.y - startSite.y
            const distance = Math.hypot(x, y)

            const dx = x / distance
            const dy = y / distance

            const B = 1 / (2 * distance)
            const A = distance / 2 - B * site[power] ** 2

            rays.push({
                dx, dy, A, B, site, region,
                //some cached values for updateRayCoefficients
                dxA: dx * A,
                dxB: dx * B,
                dyA: dy * A,
                dyB: dy * B,
            })
        }

        const sortedRays = rays.sort((x, y) => y.dy - x.dy)

        //transform array into referenced list
        for (let i = 0; i < sortedRays.length; i++) {
            const ray = sortedRays[i]

            ray.next = sortedRays[i + 1]
            ray.last = sortedRays[i - 1]
        }

        return sortedRays[0]
    }

    function startDiagram() {
        //create starting site region by intersecting it with every edge
        //honestly, can be done better, improving preparation time
        const startingRegion = regions.get(startSite)

        for (let ray = firstRay; ray; ray = ray.next) {
            const distance = ray.A + ray.B * eventDistance

            const edge = Geometry.Edge.byPointAndDirectionCoordinates(
                startSite.x + ray.dx * distance,
                startSite.y + ray.dy * distance,
                -ray.dy,
                ray.dx,
                startSite,
            )
            edge.ray = ray

            startingRegion.add(edge)
        }

        //create diagram edges corresponding to starting shore line

        let last
        for (let edge of startingRegion) {
            //add ray to virtual shore
            if (last) {
                last.shoreNext = edge.ray
                edge.ray.shoreLast = last
            }
            last = edge.ray

            //start other side region
            const twin = edge.makeTwin(edge.ray.site)

            const region = edge.ray.region
            region.add(twin)

            region._first = region._last = twin
        }
    }

    function updateRayCoefficients(ray) {
        //calculate coefficients for edge's endpoint position
        //both relative to edge start and to starting site
        const next = ray.shoreNext
        if (!next)
            return

        const d1xd2 = ray.dx * next.dx + ray.dy * next.dy
        const d1vd2 = 1 / (ray.dx * next.dy - ray.dy * next.dx)

        //edge.end = A + B * R**2
        const A = (next.A - d1xd2 * ray.A) * d1vd2
        const B = (next.B - d1xd2 * ray.B) * d1vd2

        //edge endpoint = (X0 + Ax + Bx * R**2, Y0 + Ay + By * R**2)
        ray.Ax = ray.dxA - ray.dy * A
        ray.Bx = ray.dxB - ray.dy * B
        ray.Ay = ray.dyA + ray.dx * A
        ray.By = ray.dyB + ray.dx * B
    }

    function updateRayEvent(ray) {
        //calculate when closest event of new edge being added
        //to the shore after current one is happening
        const next = ray.shoreNext
        if (!next)
            return

        //reuse event object
        if (ray.rayEvent === undefined) {
            ray.rayEvent = {
                type: PowerDiagram.EVENT_TYPES.RAY,
                distance: Infinity,
                ray,
            }
        } else {
            if (ray.rayEvent.eventRay !== undefined) {
                events.remove(ray.rayEvent)
        
                ray.rayEvent.distance = Infinity
                delete ray.rayEvent.eventRay
            }
        }

        //new edge after this one can only be spawned by rays between
        //one spawning this edge and one spawning next one
        for (let eventRay = ray.next; eventRay !== next; eventRay = eventRay.next) {
            //event distance where end point of edge (Px, Py) belongs to given eventRay
            const distance = ((eventRay.dx * ray.Ax + eventRay.dy * ray.Ay - eventRay.A) /
                              (eventRay.B - eventRay.dx * ray.Bx - eventRay.dy * ray.By))

            if (distance < ray.rayEvent.distance && distance > eventDistance) {
                ray.rayEvent.distance = distance
                ray.rayEvent.eventRay = eventRay
            }
        }

        if (!ray.rayEvent.eventRay)
            return

        events.add(ray.rayEvent)
    }

    function updateEdgeEvent(ray) {
        //calculate when this ray's virtual edge is going to disappear
        //if it's shrinking

        //infinite edges can't shrink to zero
        if (!ray.shoreNext || !ray.shoreLast)
            return

        //reuse event object
        if (ray.edgeEvent) {
            if (ray.edgeEvent.distance !== undefined) {
                events.remove(ray.edgeEvent)

                delete ray.edgeEvent.distance
            }
        } else {
            ray.edgeEvent = {
                type : PowerDiagram.EVENT_TYPES.EDGE,
                ray,
            }
        }

        const distance = (ray.shoreLast.Ay - ray.Ay) / (ray.By - ray.shoreLast.By)

        if (distance < eventDistance)
            return

        ray.edgeEvent.distance = distance

        events.add(ray.edgeEvent)
    }

    function prepareEvents() {
        //add initial pair of events for each edge that ended up being part of the starting shore
        for (let ray = firstRay; ray.shoreNext; ray = ray.shoreNext) {
            updateRayCoefficients(ray)
            updateRayEvent(ray)
            updateEdgeEvent(ray)

            startDiagramLine(ray)
        }
    }

    function startDiagramLine(ray) {
        //store the moment edge is started by the end of virtual edge
        //the rest is calculated when finishing the edge
        ray.lineStartDistance = eventDistance
    }

    function finishDiagramLine(ray, infinite = false, loop = false) {
        //create actual edges using start and end positions
        const B = Math.hypot(ray.Bx, ray.By)

        //edge of site to the right
        const right = Geometry.Edge.byPointAndDirectionCoordinates(
            ray.Ax + ray.Bx * ray.lineStartDistance + startSite.x,
            ray.Ay + ray.By * ray.lineStartDistance + startSite.y,
            ray.Bx / B,
            ray.By / B,
            ray.shoreNext.site)

        right.limit(0, infinite ? Infinity : (eventDistance - ray.lineStartDistance) * B)

        //append that edge to its region, or create it if it did not exist
        const rightRegion = ray.shoreNext.region
        if (rightRegion._last) {
            rightRegion.addAfter(rightRegion._last, right)
            rightRegion._last = right
        } else {
            rightRegion.add(right)
            rightRegion._last = rightRegion._first = right
        }

        //edge of site to the left
        const left = right.makeTwin(ray.site)

        //prepend that edge to its region, or create it if it did not exist
        const leftRegion = ray.region
        if (leftRegion._first) {
            leftRegion.addBefore(leftRegion._first,left)
            leftRegion._first = left
        } else {
            leftRegion.add(left)
            leftRegion._last = leftRegion._first = left
        }

        //if virtual edge is disappearing, then its created left edge
        //finishes region, so we tie it up properly
        if (loop) {
            leftRegion.addBefore(leftRegion._first, leftRegion._last)

            delete leftRegion._first
            delete leftRegion._last
        }
        if (infinite) {
            delete leftRegion._first
            delete rightRegion._last
        }
    }

    function processRayEvent(event) {
        //"ray" event is when edge defined by the ray that's orthogonal to it
        //and has distance A + B * R**2 from starting site
        //is close enough to be added to shore line
        //
        //this event finishes one line and creates two new ones
        const ray = event.eventRay

        finishDiagramLine(event.ray)

        //add new line to the shore
        ray.shoreNext = event.ray.shoreNext
        ray.shoreLast = event.ray
        ray.shoreNext.shoreLast = ray
        ray.shoreLast.shoreNext = ray

        //update affected shore lines
        updateRayCoefficients(ray)
        updateRayCoefficients(ray.shoreLast)

        updateRayEvent(ray)
        updateRayEvent(ray.shoreLast)

        //newly created edge can't have edge event because it's growing,
        //but it might change time its neighbours disappear
        updateEdgeEvent(ray.shoreLast)
        updateEdgeEvent(ray.shoreNext)

        startDiagramLine(ray)
        startDiagramLine(ray.shoreLast)
    }

    function processEdgeEvent(event) {
        //"edge" event is when shore edge length becomes zero
        //and it's excluded from the shore
        //this finishes two lines, closes the region and creates a new line
        const ray = event.ray

        finishDiagramLine(ray.shoreLast)
        finishDiagramLine(ray, false, true)

        ray.shoreNext.shoreLast = ray.shoreLast
        ray.shoreLast.shoreNext = ray.shoreNext
        ray.last.next = ray.next
        ray.next.last = ray.last

        events.remove(ray.rayEvent)

        updateRayCoefficients(ray.shoreLast)
        updateRayEvent(ray.shoreLast)
        updateEdgeEvent(ray.shoreLast)
        updateEdgeEvent(ray.shoreNext)

        startDiagramLine(ray.shoreLast)
    }

    function processNextEvent() {
        //picks next event, updates state and executes it accordingly
        const event = events.last(true)
        eventDistance = event.distance

        if (event.type === PowerDiagram.EVENT_TYPES.RAY) {
            processRayEvent(event)
        }

        if (event.type === PowerDiagram.EVENT_TYPES.EDGE) {
            processEdgeEvent(event)
        }

        return true
    }

    const regions = new Map()

    //get rightmost site
    const startSite = getStartSite()

    //events happening at distance closer than starting site radius dont matter
    let eventDistance = startSite[power] ** 2
    
    //prepare rays for main loop
    const firstRay = prepareRays()
    //rays have .last/.next connections for full iteration
    //and .shoreNext/.shoreLast for shore iteration

    //build starting site region and starting shore line
    startDiagram()

    //create sorted storage of events
    const events = new SortedArray((x,y) => y.distance - x.distance)
    prepareEvents()

    //process events
    while (events.length > 0)
        processNextEvent()

    //finish remaining infinite edges
    for (let ray = firstRay; ray.shoreNext; ray = ray.shoreNext) {
        finishDiagramLine(ray, true)
    }

    return regions
}


//radius modifiers : plus, multi, power ?
export default class PowerDiagram extends Diagram {
    static EVENT_TYPES = {
        RAY : 0,
        EDGE : 1,
    }
    
    constructor(sites, power = "radius") {
        super()
        this.sites = sites
        this.power = power
        this.rebuild()
    }

    static Edge(node, other, power = "radius") {
        const ABx = other.x - node.x
        const ABy = other.y - node.y
        const AB = Math.hypot(ABx, ABy)
        const dABx = ABx / AB
        const dABy = ABy / AB

        const distance = AB - node[power] - other[power]
        const centerDistance = node[power] + (distance ** 2 + 2 * distance * other[power]) / (2 * AB)

        const Cx = node.x + centerDistance * dABx
        const Cy = node.y + centerDistance * dABy

        return Geometry.Edge.byPointAndDirectionCoordinates(Cx, Cy, -dABy, dABx, node)
    }

    rebuild() {
        this.regions = buildPowerDiagram(this.sites, this.power)
    }

    limitRegionsByCircle(circle) {
        for (let [site, region] of this.regions) {
            if (!region.start)
                continue

            circle[this.power] ??= circle.radius
            const circleEdge = this.constructor.Edge(circle, site, this.power)
            circleEdge.site = site

            if (!region.add(circleEdge)) {
                if (!region.start.last || circleEdge.pointSide(region.start.endX, region.start.endY) < 0)
                    region.clear()
            }
        }
    }
}
