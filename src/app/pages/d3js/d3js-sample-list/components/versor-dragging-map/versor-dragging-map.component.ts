import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import * as versor from 'versor';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {geoOrthographic, geoPath} from 'd3-geo';

@Component({
  selector: 'app-versor-dragging-map',
  templateUrl: './versor-dragging-map.component.html',
  styleUrls: ['./versor-dragging-map.component.scss'],
})
export class VersorDraggingMapComponent implements OnInit {
  @ViewChild('versorDragging', {static: true}) versorDragging: ElementRef;
  @ViewChild('canvasVersor', {static: true}) canvasVersor: ElementRef;
  svg: any;
  width = 1000;
  height = 954;
  land110 = [];
  land50 = [];
  isBusy = true;
  sphere = {type: 'Sphere'};
  context;
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getDataLand110().subscribe(data => {
      this.land110 = data;
      this.getDataLand50().subscribe(data50 => {
        this.land50 = data50;
        this.chart();
      });
    });
  }

  getDataLand110(): Observable<any> {
    return this.http.get('assets/d3/data/land110.json');
  }

  getDataLand50(): Observable<any> {
    return this.http.get('assets/d3/data/land50.json');
  }

  chart() {
    // this.svg = d3.select(this.versorDragging.nativeElement).append('svg')
    //   .attr('width', '100%')
    //   .attr('height', '100%')
    //   .attr('viewBox', [0, 0, this.width, this.height]);
    const canvas = this.canvasVersor.nativeElement;

    this.context = canvas.getContext('2d');

    return d3.select(this.context.canvas)
      .call(this.drag(this.projection())
          .on('drag.render', () => {
            return this.render(this.land110);
          })
          .on('end.render', () => this.render(this.land50)))
      .call(() => this.render(this.land50))
      .node();
  }

  render = (land) => {
    console.log('render land');
    const path = geoPath(this.projection(), this.context);
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.beginPath(), path(this.sphere), this.context.fillStyle = '#fff', this.context.fill();
    this.context.beginPath(), path(land), this.context.fillStyle = '#000', this.context.fill();
    this.context.beginPath(), path(this.sphere), this.context.stroke();
  }

  projection = () => geoOrthographic();

  drag(projection) {
    let v0, q0, r0;

    function dragstarted() {
      console.log('drag render started', projection);
      v0 = versor.cartesian(projection.invert([d3.event.x, d3.event.y]));
      q0 = versor(r0 = projection.rotate());
    }

    function dragged() {
      const v1 = versor.cartesian(projection.rotate(r0).invert([d3.event.x, d3.event.y]));
      const q1 = versor.multiply(q0, versor.delta(v0, v1));
      console.log('dragged', v1);
      projection.rotate(versor.rotation(q1));
    }

    return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged);
  }
}
