import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import * as d3Array from 'd3-array';

@Component({
  selector: 'app-bar-chart-race',
  templateUrl: './bar-chart-race.component.html',
  styleUrls: ['./bar-chart-race.component.scss'],
})
export class BarChartRaceComponent implements OnInit {
  isBusy = true;
  data = [];
  svg: any;
  width = 500;
  n = 12;
  k = 10;
  margin = {top: 20, right: 0, bottom: 30, left: 40};
  height = 500;
  @ViewChild('svgBarChartRace', {static: true}) svgBarChartRace: ElementRef;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getData().subscribe(data => {
      this.data = data;
      this.chart();
      this.isBusy = false;
    });
  }

  getData(): Observable<any> {
    return this.http.get('assets/d3/data/barChartRace.json');
  }

  chart() {
    this.svg = d3.select(this.svgBarChartRace.nativeElement).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, this.width, this.height])
      .call(this.zoom);

    this.svg.append('g')
        .attr('class', 'bars')
        .attr('fill', 'steelblue')
      .selectAll('rect')
      .data(this.data)
      .join('rect')
        .attr('x', d => this.x()(d.name))
        .attr('y', d => this.y()(d.value))
        .attr('height', d => this.y()(0) - this.y()(d.value))
        .attr('width', this.x().bandwidth());
    this.svg.append('g')
        .attr('class', 'x-axis')
        .call(this.xAxis);

    this.svg.append('g')
        .attr('class', 'y-axis')
        .call(this.yAxis);

    return this.svg.node();
  }

  yAxis = g => g
    .attr('transform', `translate(${this.margin.left},0)`)
    .call(d3.axisLeft(this.y()))
    .call(gg => gg.select('.domain').remove())

  xAxis = g => g
    .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
    .call(d3.axisBottom(this.x()).tickSizeOuter(0))

  y = () => d3.scaleLinear()
    .domain([0, d3.max(this.data, d => d.value)]).nice()
    .range([this.height - this.margin.bottom, this.margin.top])

  x = () => d3.scaleBand()
    .domain(this.data.map(d => d.name))
    .range([this.margin.left, this.width - this.margin.right])
    .padding(0.1)

  zoom = (svg) => {
    const extent = [[this.margin.left, this.margin.top], [this.width - this.margin.right, this.height - this.margin.top]];

    svg.call(d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent(extent)
        .extent(extent)
        .on('zoom', this.zoomed));
  }

  zoomed = () => {
    this.x().range([this.margin.left, this.width - this.margin.right].map(d => d3.event.transform.applyX(d)));
    this.svg.selectAll('.bars rect').attr('x', d => this.x()(d.name)).attr('width', this.x().bandwidth());
    this.svg.selectAll('.x-axis').call(this.xAxis);
  }

}
