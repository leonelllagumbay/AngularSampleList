import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as d3Array from 'd3-array';

@Component({
  selector: 'app-cumsum',
  templateUrl: './cumsum.component.html',
  styleUrls: ['./cumsum.component.scss'],
})
export class CumsumComponent implements OnInit {
  @ViewChild('svg', {static: true}) hostElement: ElementRef;
  svg;
  width = 500;
  height = 400;
  data: any;
  margin = {top: 20, right: 30, bottom: 30, left: 40};
  is1D = true;
  constructor() { }

  ngOnInit() {
    this.data = this.is1D ? this.getData() : this.getData2D();
    this.chart();
    console.log('test', this.x()('1'));
  }

  toggleDimension() {
    d3.select(this.hostElement.nativeElement).select('*').remove();
    this.is1D = !this.is1D;
    this.data = this.is1D ? this.getData() : this.getData2D();
    this.chart();
  }

  chart() {
    this.svg = d3.select(this.hostElement.nativeElement).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 ' + this.width + ' ' + this.height);

    this.svg.append('path')
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-miterlimit', 1)
      .attr('stroke-width', 1)
      .attr('d', this.line()(this.data));

    return this.svg.node();
  }

  getData() {
    const randomWalk1d = this.randomWalk1d();
    const newData = [];
    randomWalk1d.forEach((rw, index) => {
      newData.push({
        x: index,
        y: rw
      });
    });
    return newData;
  }

  getData2D() {
    const randomWalk1d = this.randomWalk2d();
    const newData = [];
    randomWalk1d.forEach((rw) => {
      newData.push({
        x: rw[0],
        y: rw[1]
      });
    });
    return newData;
  }

  normal = () => d3.randomNormal(0, 4);

  randomWalk1d = () => (d3Array as any).cumsum({length: this.width - 20}, this.normal());

  randomWalk2d = () => d3.zip(
    (d3Array as any).cumsum({length: 4000}, this.normal()),
    (d3Array as any).cumsum({length: 4000}, this.normal())
  )

  line = () => d3.line()
    .x((d: any) => {
      return this.is1D ? (this.x()(d.x) + this.x().bandwidth() / 2) : this.x2()(d.x);
    })
    .y((d: any) => {
      return this.y()(d.y);
    })

  x2 = () => (d3 as any).scaleLinear()
    .domain(d3.extent(this.data, (d: any) => d.x))
    .rangeRound([this.margin.left, this.width - this.margin.right])

  x() {
    return d3.scaleBand()
    .domain(this.data.map(d => d.x))
    .range([this.margin.left, this.width - this.margin.right])
    .padding(0.1);
  }

  y = () => (d3 as any).scaleLinear()
    .domain(d3.extent(this.data, (d: any) => d.y))
    .rangeRound([(this.height / 2) - this.margin.bottom, this.margin.top])
}
