import {Component,Input,Output,EventEmitter,OnChanges,SimpleChange} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {Renderer, Node, Edge, ForceDirectedLayout, Graph, Vector, BoundingBox} from './springy';
import {ModelType, ModelProperty} from '../../index';
import {DraggableDirective} from '../draggable/draggable.directive';
//import * as _ from 'lodash';

@Component({
  selector: 'typegraph',
  templateUrl: 'app/shared/components/typegraph/typegraph.component.html',
  styleUrls: ['app/shared/components/typegraph/typegraph.component.css'],
  directives: [CORE_DIRECTIVES,DraggableDirective]
})
export class TypeGraphComponent implements OnChanges {

  renderer: Renderer;
  graph: Graph;
  layout: ForceDirectedLayout;

  canvas: any = {width: 1000, height: 1000};
  nodeSize: number = 50;
  locationPathname: string;

  boundingBox: BoundingBox = null;

  @Input() showAggregations: boolean = false;
  @Input() showInheritance: boolean = true;
  @Input() modelTypes: Array<ModelType> = [];
  @Output() nodeClicked = new EventEmitter<{modelType: ModelType, event: MouseEvent}>();

  constructor() {
    this.graph = new Graph();
    this.layout = new ForceDirectedLayout(this.graph, 100, 1000, 0.5, 2);
    this.renderer = new Renderer(this.layout, () => {;}, this.drawEdge, this.drawNode, this.onRenderStop, this.onRenderStart);
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    this.renderGraphFromNodes(this.modelTypes);
  }

  ngAfterViewInit() {
    this.locationPathname = location.pathname;
  }

  renderGraphFromNodes(primaryTypes: Array<ModelType>) {
    this.clearGraph();
    primaryTypes.forEach((modelType) => {
      this.addModelType(modelType, true);
      if(this.showAggregations) {
        modelType.properties.forEach((property) => {
          if (property.referencedType) {
            this.addModelType(property.referencedType, false);
          }
        });
      }
      if(this.showInheritance) {
        modelType.ancestors.forEach((ancestor) => this.addModelType(ancestor, false));
      }
    });
    this.createEdgesForModelTypes(this.showAggregations, this.showInheritance);
    this.renderer.start();
  }

  clearGraph() {
    this.graph.filterEdges((e) => false);
    this.graph.filterNodes((e) => false);
    console.debug(`Graph cleared ${this.graph.nodes.length} nodes left, ${this.graph.edges.length} edges left`)
  }

  //TODO: make a more efficient edge lookup to speed up dragging
  edgeLookup(nodeId: string): {inbound: Array<Edge>, outbound: Array<Edge>} {
    const result = { inbound: <Array<Edge>>[], outbound: <Array<Edge>>[] };
    for(let edge of this.graph.edges) {
      if(edge.source.id === nodeId) {
        result.outbound.push(edge);
      }
      if(edge.target.id === nodeId) {
        result.inbound.push(edge);
      }
    }
    return result;
  }

  addModelType(modelType: ModelType, isPrimary: boolean) {
    const existingNode = this.graph.nodeSet[modelType.name];
    if(this.graph.nodeSet[modelType.name] !== undefined) {
      existingNode.data.isPrimary |= <any>isPrimary;
      console.debug('ModelType already in the graph', modelType.name);
      return;
    }
    const nodeData = new NodeData(
      modelType,
      (nodeId) => this.edgeLookup(nodeId),
      isPrimary
    );
    const node: ANode = new Node(modelType.name, nodeData);
    this.graph.addNode(node);
  }

  createEdgesForModelTypes(includeAggregations: boolean, includeInheritance: boolean) {
    this.layout.eachNode((node: ANode, p: any) => {
      const modelType = node.data.modelType;
      if(includeInheritance && modelType.superType) {
        const superTypeNode = this.graph.nodeSet[modelType.superType.name];
        if(superTypeNode) {
          this.addEdgeBetweenNodes(node, superTypeNode, 'inheritance');
        }
      }
      const addEdgeToType = (modelType: ModelType, type: string) => {
        const typeNode = this.graph.nodeSet[modelType.name];
        if(typeNode) {
          this.addEdgeBetweenNodes(node, typeNode, type);
        }
      };
      if(includeAggregations) {
        modelType.properties.forEach((prop: ModelProperty) => {
          if(prop.referencedType) {
            addEdgeToType(prop.referencedType, 'aggregation');
          }
        });
      }
    });
  }

  addEdgeBetweenNodes(node1: ANode, node2: ANode, type: String) {
    const id = `${node1.data.modelType.name}->${node2.data.modelType.name}`;
    const existingEdges = this.graph.getEdges(node1, node2);
    if(existingEdges.length > 0) {
      console.debug('Edge already in the model', id);
      return;
    }
    const edge: AnEdge = new Edge(id, node1, node2, new EdgeData(type));
    this.graph.addEdge(edge);
  }

  toUICoordinates(v: Vector): Vector {
    let bb = this.layout.getBoundingBox(); //TODO: don't do this more than once per simulation pass
    let bbSize = bb.topRight.subtract(bb.bottomLeft);
    if(bbSize.magnitude() === 0) { // Prevent divide by zero problem when there's only one node
      return new Vector(this.nodeSize, this.nodeSize);
    }
    let uiWidth = this.canvas.width;
    let uiHeight = this.canvas.height;

    let sx = (v.x - bb.bottomLeft.x) / bbSize.x * uiWidth;
    let sy = (v.y - bb.bottomLeft.y) / bbSize.y * uiHeight;

    return new Vector(sx, sy);
  }

  onClick(node: Node, event: MouseEvent) {
    if(node.data.dragOffset.magnitude() === 0) {
      // Only fire event if it wasn't a drag
      this.nodeClicked.emit({modelType: node.data.modelType, event: event});
    }
  }

  // Callbacks for the rendering (capture the 'this' on declaration)
  drawEdge = (edge: AnEdge, pos1: Vector, pos2: Vector) => {
    edge.data.pos1 = this.toUICoordinates(pos1);
    edge.data.pos2 = this.toUICoordinates(pos2);
  };
  drawNode = (node: ANode, pos: Vector) => {
    node.data.pos = this.toUICoordinates(pos);
    node.data.dragOffset = new Vector(0,0);
    node.data.updateTransform();
  };
  onRenderStart = () => {
    console.time('render');
    this.boundingBox = this.layout.getBoundingBox();

  };
  onRenderStop = () => {
    console.timeEnd('render');
  };
}

class EdgeData {
  pos1: Vector = new Vector(0,0);
  pos2: Vector = new Vector(0,0);
  constructor(public type: String) {}
}

interface AnEdge extends Edge {
  data: EdgeData;
}

class NodeData {
  transform: string = '';
  pos: Vector = new Vector(0,0);
  dragOffset: Vector = new Vector(0,0);

  constructor(
    public modelType: ModelType,
    public edgeLookup: (nodeId: string) => ({inbound: Array<Edge>, outbound: Array<Edge>}),
    public isPrimary: boolean) {}

  drag(pos: {x: number, y: number}) {
    this.dragOffset = new Vector(pos.x,pos.y);
    this.updateTransform();
  }
  dragEnd() {
    this.pos = this.pos.add(this.dragOffset);
    this.dragOffset = new Vector(0,0);
    this.updateTransform();
  }
  updateTransform() {
    const p = this.pos.add(this.dragOffset);
    const edges = this.edgeLookup(this.modelType.name);
    edges.outbound.forEach((e) => e.data.pos1 = p);
    edges.inbound.forEach((e) => e.data.pos2 = p);
    this.transform = `translate(${p.x},${p.y})`;
  }
}

interface ANode extends Node {
  data: NodeData;
}
