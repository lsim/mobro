import {Component,Input,OnChanges,SimpleChange} from 'angular2/core';
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

  nodes: Array<ANode> = [];
  nodeMap: {[key: string]: ANode};
  edgeMap: {[key: string]: AnEdge};

  canvas: any = {width: 1000, height: 1000};
  nodeSize: number = 50;

  boundingBox: BoundingBox = null;

  @Input() modelTypes: Array<ModelType> = [];

  constructor() {
    this.graph = new Graph();
    this.layout = new ForceDirectedLayout(this.graph, 100, 1000, 0.5, 2);
    this.renderer = new Renderer(this.layout, this.clear, this.drawEdge, this.drawNode, this.onRenderStop, this.onRenderStart);
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    const change = changes['modelTypes'];
    const currentValue: Array<ModelType> = change.currentValue;
    if(!currentValue || currentValue.length === 0) {
      return;
    }
    this.nodes = [];
    this.nodeMap = {};
    this.graph.filterNodes((n) => false);
    currentValue.forEach((mt) => this.addModelType(mt));
    this.createEdgesForModelTypes(true, false);
    this.renderer.start();
  }

  addModelType(modelType: ModelType) {
    if(this.nodeMap[modelType.name] !== undefined) {
      console.debug('Model already in the model', modelType.name);
      return;
    }
    const nodeData = new NodeData(modelType);
    const node: ANode = new Node(modelType.name, nodeData);
    this.nodes.push(node);
    this.nodeMap[modelType.name] = node;
    this.graph.addNode(node);
  }

  createEdgesForModelTypes(includeAggregations: boolean, includeInheritance: boolean) {
    // Clear any existing edges first
    this.graph.filterEdges((e) => false);
    this.edgeMap = {};
    this.nodes.forEach((node) => {
      //TODO: add different types of edges to super type, sub types, aggregations respectively
      const modelType = node.data.modelType;
      if(includeInheritance && modelType.superType) {
        const superTypeNode = this.nodeMap[modelType.superType.name];
        if(superTypeNode) {
          this.addEdgeBetweenNodes(node, superTypeNode);
        }
      }
      const addEdgeToType = (modelType: ModelType) => {
        const typeNode = this.nodeMap[modelType.name];
        if(typeNode) {
          this.addEdgeBetweenNodes(node, typeNode);
        }
      };
      //modelType.subtypes.forEach(addEdgeToType);
      if(includeAggregations) {
        modelType.properties.forEach((prop: ModelProperty) => {
          if(prop.referencedType) {
            addEdgeToType(prop.referencedType);
          }
        });
      }
    });
  }

  addEdgeBetweenNodes(node1: ANode, node2: ANode) {
    const id = `${node1.data.modelType.name}->${node2.data.modelType.name}`;
    if(this.edgeMap[id] !== undefined) {
      console.debug('Edge already in the model', id);
      return;
    }
    const edge: AnEdge = new Edge(id, node1, node2, new EdgeData());
    node1.data.outboundEdges.push(edge);
    node2.data.inboundEdges.push(edge);
    this.edgeMap[id] = edge;
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
}

interface AnEdge extends Edge {
  data: EdgeData;
}

class NodeData {
  transform: string = '';
  pos: Vector = new Vector(0,0);
  dragOffset: Vector = new Vector(0,0);
  inboundEdges: Array<Edge> = [];
  outboundEdges: Array<Edge> = [];

  constructor(public modelType: ModelType) {}

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
    let p = this.pos.add(this.dragOffset);
    this.outboundEdges.forEach((e) => e.data.pos1 = p);
    this.inboundEdges.forEach((e) => e.data.pos2 = p);
    this.transform = `translate(${p.x},${p.y})`;
  }
}

interface ANode extends Node {
  data: NodeData;
}
