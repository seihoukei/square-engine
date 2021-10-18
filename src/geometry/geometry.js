import Circle from "./geometry-circle.js"
import Edge from "./geometry-edge.js"
import Region from "./geometry-region.js"
import Diagram from "./geometry-diagram.js"
import PowerDiagram from "./geometry-power-diagram.js"
import VoronoiDiagram from "./geometry-voronoi-diagram.js"

export default class Geometry {
    static PRECISION = 1e-6
    static LENGTH_CAP = 1000
    static CAP_INFINITY = 100000

    static direction(from, to) {
        return Math.atan2(to.y - from.y, to.x - from.x)
    }

    static Circle = Circle
    static Edge = Edge
    static Region = Region
    static Diagram = Diagram
    static PowerDiagram = PowerDiagram
    static VoronoiDiagram = VoronoiDiagram
}
