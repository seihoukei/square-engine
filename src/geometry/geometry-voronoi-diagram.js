import SortedArray from "../utility/sorted-array.js"
import Geometry from "./geometry.js"

import Diagram from "./geometry-diagram.js"

function buildVoronoiDiagram(sites) {
    //function uses variation of Fortune's algorithm
    //we don't actually track or store arcs as edges are enough
    //to represent shore state

    function eventSorter (first, second) {
        return second.y - first.y
    }

    function preparePointEvents() {
        let pointEvents = []
        for (let site of sites) {
            const region = new Geometry.Region({
                site
            })
            regions.set(site, region)
            const fakeSite = {
                x : site.x,
                y : site.y,
                real : site,
                region,
            }
            const event = {
                y : site.y,
                site : fakeSite,
            }
            pointEvents.push(event)
        }
        return pointEvents.sort(eventSorter)
    }

    function getEdgePositionX(edge) {
        if (edge._borderY === eventDistance)
            return edge._borderX

        const distance = eventDistance - edge.y

        const A = - (edge.dx ** 2)
        const B = - 2 * distance * edge.dy
        const C = distance ** 2 - edge._AM2

        const D = B ** 2 - 4 * A * C

        const l = (- B - D ** 0.5) / (2 * A)

        edge._borderX = edge.x + l * edge.dx
        edge._borderY = eventDistance

        return edge._borderX
    }

    function getInsertPosition(x, start = 0, end = edges.length) {
        if (start >= end)
            return start

        let middle = (start + end) / 2 | 0

        if (getEdgePositionX(edges[middle]) < x - Geometry.PRECISION)
            return getInsertPosition(x, middle + 1, end)

        return getInsertPosition(x, start, middle)
    }

    function getOtherSite(x) {
        if (edges.length === 0)
            return firstSite

        const position = getInsertPosition(x,  0, edges.length - 1)
        const edge = edges[position]

        if (getEdgePositionX(edge) > x)
            return edge.twin.site

        return edge.site
    }

    function clearEdgeEvent(edge) {
        const pastEvent = edge._event
        if (!pastEvent)
            return

        delete pastEvent.first._event
        delete pastEvent.second._event

        circleEvents.remove(pastEvent)
    }

    function updateEdgeEvents(first, second, event) {
        if (first._event && first._event.y < event.y)
            return
        if (second._event && second._event.y < event.y)
            return

        clearEdgeEvent(first)
        clearEdgeEvent(second)

        first._event = second._event = event

        circleEvents.add(event)
    }

    function intersectEdges(first, second) {
        second = second.twin

        if (first.site !== second.site)
            return

        if (first.dx * second.dy > first.dy * second.dx)
            [first, second] = [second, first]

        second = second.twin

        const intersection = first.intersectEdge(second, true)
        if (!intersection)
            return

        const y = first.intersectionY + (first._AM2 + first.intersection ** 2) ** 0.5

        if (y < eventDistance)
            return

        const event = {
            first, second, y,
            firstIntersection : first.intersection,
            secondIntersection : second.intersection,
        }

        updateEdgeEvents(first, second, event)
    }

    function storeEdge(edge, x, direction = 0, position = getInsertPosition(x)) {
        edges.splice(position, 0, edge)

        if (position > 0 && direction < 1)
            intersectEdges(edges[position-1], edge)

        if (position < edges.length - 1 && direction > -1)
            intersectEdges(edge, edges[position+1])

        return position
    }

    function finalizeEdge(edge) {
        clearEdgeEvent(edge)

        delete edge._AM2
        delete edge._borderX
        delete edge._borderY

        const i = edges.indexOf(edge)
        if (i === -1)
            return

        edges.splice(i, 1)

        if (i > 0 && i < edges.length)
            intersectEdges(edges[i-1], edges[i])
    }

    function connectEdges(first, second, after = false) {
        const region = first.site.region

        if (!region.start)
            region.add(first.twin)

        if (after)
            region.addAfter(first.twin, second, false)
        else
            region.addBefore(first.twin, second, false)
    }

    function createLine(site, other, leftEdge, rightEdge) {
        const NOx = other.x - site.x
        const NOy = other.y - site.y
        const NO = Math.hypot(NOx, NOy)

        const first = Geometry.Edge.byPointAndDirectionCoordinates(
            site.x + NOx / 2,
            site.y + NOy / 2,
            NOy / NO,
            -(NOx / NO),
            site)

        const second = first.makeTwin(other)

        first._AM2 = second._AM2 = (NO / 2) ** 2

        first._borderX = second._borderX = site.x
        first._borderY = second._borderY = eventDistance

        if (leftEdge) { //circle event, spawning third ray
            first.intersectEdge(leftEdge)
            first.limit(undefined,first.intersection)
            second.limit(-first.intersection)

            finalizeEdge(first)

            connectEdges(leftEdge, second, true)
            connectEdges(rightEdge, first)

            storeEdge(second, first.intersectionX, 0)
            return
        }

        //point event, spawning two rays
        const position = storeEdge(first, site.x, -1)
        storeEdge(second, site.x, 1, position + 1)
    }

    function processPointEvent(event) {
        createLine(event.site, getOtherSite(event.site.x))
    }

    function processCircleEvent(event) {
        let first = event.first
        let second = event.second

        first.limit(undefined, event.firstIntersection, true)
        second.limit(undefined, event.secondIntersection, true)

        finalizeEdge(first)
        finalizeEdge(second)

        connectEdges(first, second)

        createLine(first.twin.site, second.site, first.twin, second)
    }

    function processNextEvent() {
        const circleEvent = circleEvents.last()
        const pointEvent = pointEvents[pointEvents.length - 1]

        if (pointEvent && (!circleEvent || circleEvent.y > pointEvent.y)) {
            pointEvents.pop()
            eventDistance = pointEvent.y

            processPointEvent(pointEvent)

            return
        }

        circleEvents.last(true)
        eventDistance = circleEvent.y

        processCircleEvent(circleEvent)
    }

    const regions = new Map()
    if (sites.length === 0)
        return regions

    let eventDistance = 0
    const circleEvents = new SortedArray(eventSorter)
    const pointEvents = preparePointEvents()

    const firstSite = pointEvents.pop().site

    const edges = []

    while (circleEvents.length > 0 || pointEvents.length > 0)
        processNextEvent()

    for (let edge of edges) {
        edge.site.region.setStart(edge.twin)
    }

    for (let [, region] of regions)
        for (let edge of region) {
            if (!edge.twin.site.real)
                continue
            const real = edge.site.real
            edge.site = edge.twin.site.real
            edge.twin.site = real
        }

    return regions
}

// noinspection JSUnusedGlobalSymbols
export default class VoronoiDiagram extends Diagram {
    constructor(sites) {
        super()
        this.sites = sites
        this.rebuild()
    }

    rebuild() {
        this.regions = buildVoronoiDiagram(this.sites)
    }

    static Edge(node, other) {
        const ABx = other.x - node.x
        const ABy = other.y - node.y
        const AB = Math.hypot(ABx, ABy)
        const dABx = ABx / AB
        const dABy = ABy / AB

        const Cx = node.x + ABx / 2
        const Cy = node.y + ABy / 2

        return Geometry.Edge.byPointAndDirectionCoordinates(Cx, Cy, -dABy, dABx, node)
    }

    limitRegionsByCircle(circle) {
        for (let [,region] of this)
            region.voronoiCrop(circle)
    }
}
