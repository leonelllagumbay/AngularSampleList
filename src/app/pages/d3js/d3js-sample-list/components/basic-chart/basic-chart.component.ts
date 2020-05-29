import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as d3Array from 'd3-array';

@Component({
  selector: 'app-basic-chart',
  templateUrl: './basic-chart.component.html',
  styleUrls: ['./basic-chart.component.scss'],
})
export class BasicChartComponent implements OnInit {
  isBusy = true;
  @ViewChild('svg', {static: true}) hostElement: ElementRef; // Native element hosting the SVG container
  svg; // Top level SVG element

  width = 800;
  height = 500;
  margin = {top: 20, right: 30, bottom: 30, left: 40};
  data = [];
  constructor(private elRef: ElementRef, private http: HttpClient) {
    // this.hostElement = this.elRef.nativeElement;
  }

  ngOnInit() {
    this.getData().subscribe(data => {
      this.data = data;
      setTimeout(() => {
        this.chart();
        this.isBusy = false;
      }, 2000);
    });
  }

  chart() {
    this.svg = d3.select(this.hostElement.nativeElement).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 ' + this.width + ' ' + this.height);

    this.svg.append('g')
     .selectAll('path')
     .data(this.series())
      .join('path')
      .attr('fill', ({key}) => this.color()(key))
      .attr('d', d => {
        return this.area()(d);
      })
      .append('title')
        .text(({key}) => key);

    this.svg.append('g')
      .call(this.xAxis);

    this.svg.append('g')
      .call(this.yAxis);

    return this.svg.node();
  }

  getData(): Observable<any> {
    return this.http.get('assets/d3/basicChartData.json');
  }

  keys() {
    return Array.from(d3Array.group(this.data, d => d.key).keys());
  }

  values() {
    return Array.from((d3Array as any).rollup(
        this.data,
        ([dd]) => dd.value, //
        dd => new Date(dd.date).getTime(),
        dd => dd.key
      )
    );
  }

  series() {
    const v = [...this.values()]; // Avoid infinite loop
    return d3.stack()
      .keys(this.keys())
      .value(([, vv]: any, key) => {
        return vv.get(key);
      })
      .order(this.order())((v  as any));
  }

  order() {
    return d3.stackOrderNone;
  }

  area = () => (d3 as any).area()
      .x(d => this.x()(d.data[0]))
      .y0(d => this.y()(d[0]))
      .y1(d => this.y()(d[1]))

  x = () => d3.scaleUtc()
      .domain(d3.extent(this.data, d => {
        return new Date(d.date).getTime();
      }))
      .range([this.margin.left, this.width - this.margin.right])

  y = () => d3.scaleLinear()
    .domain([0, d3.max(this.series(), dd => d3.max(dd, d => d[1]))]).nice()
    .range([this.height - this.margin.bottom, this.margin.top])

  color = () =>  {
    return d3.scaleOrdinal()
    .domain(this.keys())
    .range(d3.schemeCategory10);
  }

  xAxis = g => g
    .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
    .call(d3.axisBottom(this.x()).ticks(this.width / 80).tickSizeOuter(0))

  yAxis = g => g
    .attr('transform', `translate(${this.margin.left},0)`)
    .call(d3.axisLeft(this.y()))
    .call((gg: any) => gg.select('.domain').remove())
    .call(gg => gg.select('.tick:last-of-type text').clone()
        .attr('x', 3)
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold')
        .text((this.data as any).y))
}
