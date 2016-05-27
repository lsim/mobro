import {Component,Input,OnChanges,SimpleChange} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {Renderer, Node, Edge, ForceDirectedLayout, Graph, Vector, BoundingBox} from './springy';
import {ModelType, ModelProperty} from '../../index';
import {DraggableDirective} from '../draggable/draggable.directive';
import * as _ from 'lodash';

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

  @Input() modelTypes: Array<ModelType> = [];

  constructor() {
    this.graph = new Graph();
    this.layout = new ForceDirectedLayout(this.graph, 100, 1000, 0.5, 2);
    this.renderer = new Renderer(this.layout, this.clear, this.drawEdge, this.drawNode, this.onRenderStop, this.onRenderStart);
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    this.handleModelTypesChange(changes['modelTypes']);
  }

  ngAfterViewInit() {
    this.locationPathname = location.pathname;
  }

  handleModelTypesChange(change: SimpleChange) {
    const currentValue = <Array<ModelType>>change.currentValue;
    const previousValue = <Array<ModelType>>change.previousValue;
    const toBeAdded = _.difference(currentValue, previousValue);
    const toBeRemoved = _.difference(previousValue, currentValue);
    toBeAdded.forEach((mt: ModelType) => this.addModelType(mt));
    toBeRemoved.forEach((mt: ModelType) => this.removeModelType(mt));
    this.createEdgesForModelTypes(true, true);
    this.renderer.start();
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

  addModelType(modelType: ModelType) {
    if(this.graph.nodeSet[modelType.name] !== undefined) {
      console.debug('ModelType already in the graph', modelType.name);
      return;
    }
    const nodeData = new NodeData(modelType, (nodeId) => this.edgeLookup(nodeId));
    const node: ANode = new Node(modelType.name, nodeData);
    this.graph.addNode(node);
  }

  removeModelType(modelType: ModelType) {
    const node = this.graph.nodeSet[modelType.name];
    if(node) {
      this.graph.removeNode(node);
    }
  }

  createEdgesForModelTypes(includeAggregations: boolean, includeInheritance: boolean) {
    this.layout.eachNode((node: ANode, p: any) => {
      //TODO: add different types of edges to super type, sub types, aggregations respectively
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

    let uiWidth = this.canvas.width;
    let uiHeight = this.canvas.height;

    let sx = (v.x - bb.bottomLeft.x) / bbSize.x * uiWidth;
    let sy = (v.y - bb.bottomLeft.y) / bbSize.y * uiHeight;

    return new Vector(sx, sy);
  }

  // Callbacks for the rendering (capture the 'this' on declaration)
  clear = () => {
    console.debug('clear');
  };
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

  constructor(public modelType: ModelType, public edgeLookup: (nodeId: string) => ({inbound: Array<Edge>, outbound: Array<Edge>})) {}

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
