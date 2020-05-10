import { Component, OnInit } from '@angular/core';

const tfModel = 'tfModel';

// Tensors -> rank, shape, dtype
/**
 * A tensor is the metadata of a retained data. A tensor only keeps the pointer to the
 * underlying data array so that we can isolate the manipulation of the tensor's shape and the
 * transformation of the actual data array.
 *
 * data types: float32, int32, bool, complex64, and string
 */

// const t1 = tf.tensor1d([1, 2, 3]);
// t1.print();

// const t2 = tf.tensor2d([1, 2, 3, 4], [2, 2]);
// t2.print();

// Asynchronous API
// t1.data(() => {
//   // console.log('async', d); // Float32Array(3) [1, 2, 3]
// });
// t1.data().then((d: any) => {
//   console.log('async', d); // Float32Array(3) [1, 2, 3]
// });

// Synchonous API
// console.log('synchronous', t1.dataSync()); // Float32Array(3) [1, 2, 3]

// // Operations
// const t3 = tf.tensor([1, 2, 3, 4]);
// const t4 = tf.tensor([10, 20, 30, 40]);
// const t5 = t3.add(t4);
// // Or
// tf.add(t3, t4);

// t5.data().then((d: any) => {
//   console.log('async t5', d);
// });

/**
 * Memory dispose
 */

// console.log('memory', tf.memory());
// // -> {unreliable: false, numBytesInGPU: 0, numTensors: 0, numDataBuffers: 0, numBytes: 0}
// const a = tf.tensor([1, 2, 3]);
// console.log('memory now', tf.memory());
// // -> {unreliable: false, numBytesInGPU: 0, numTensors: 1, numDataBuffers: 1, numBytes: 12}
// a.dispose();
// console.log('memory after dispose', tf.memory());
// // -> {unreliable: false, numBytesInGPU: 0, numTensors: 0, numDataBuffers: 0, numBytes: 0}

// const b = tf.tensor([1, 2, 3]);
// const y = tf.tidy(() => {
//   console.log('tidy dispose');
//   const result = b.log().neg().round();
//   return result;
// });

/**
 * Eager execution
 */

// const c = tf.tensor([1, 2, 3]);
// // Operation chain does not execute the computation by itself.
// const result = c.square().log().neg().floor();
// // Getting the result will kick the computation of result and all dependent operations.
// result.data().then(d => {
//  console.log('eager exec chain', d);
// });


/**
 * The Layers API
 * - Sequential model: With the sequential model API, you can construct the model by piling up each layer. 
 */

// const model = tf.sequential({
//   layers: [
//   tf.layers.dense({inputShape: [784], units: 16, activation: 'relu'}),
//   tf.layers.dense({units: 10, activation: 'softmax'}),
//   ]
//  });

 /**
  * The input
  * shape is the size of the input tensor, so if the input shape is [BatchSize, 784], the input
  * shape of each data point would be [784]. You can inspect the layers of the model by
  * accessing model.layers, model.inputLayers, and model.outputLayers.
  */

// Adding models later
// const model2 = tf.sequential();
// model2.add(tf.layers.dense({inputShape: [784], units: 32, activation:
// 'relu'}));
// model2.add(tf.layers.dense({units: 10, activation: 'softmax'}));

/**
 * Functional model: Another way to create a model with the Layers API is to use the functional model API. This
 * API allows you to add an arbitrary layer to the model, as long as it doesn't have cycles.
 */

// const input = tf.input({shape: [784]});
// const dense1 = tf.layers.dense({units: 16, activation:
// 'relu'}).apply(input);
// const dense2 = tf.layers.dense({units: 10, activation:
// 'softmax'}).apply(dense1); // apply method used to connect each layer
// const model2 = tf.model({inputs: input, outputs: dense2});

/**
 *  Therefore, we need
 *  to create a SymbolicTensor for every layer, including the input layer. tf.input creates
 *  a SymbolicTensor so that it can operate consistently with the functional model. Moreover,
 *  the functional model API returns a concrete tensor instead of a SymbolicTensor if it gets a
 *  concrete tensor as input, as shown in the following code:
 */

// const input2 = tf.tensor([-2, 1, 0, 5]);
// const output = tf.layers.activation({activation: 'relu'}).apply(input2);
// (output as any).print(); // [0, 1, 0, 5]

/**
 * Like the sequential model, you can inspect each layer by
 * accessing model.layers, model.inputLayers,
 * and model.outputLayers.
 */

// console.log('model.layers', model.layers);
// console.log('model.inputLayers', model.inputLayers);
// console.log('model.outputLayers', model.outputLayers);
// console.log('model summary', model.summary());

/**
 * One of the major benefits of using the Layers API is that we can validate the input shape of each layer. T
 */

/**
 * Custom layers
 */
// class NegativeLayer extends tf.layers.Layer {
//  constructor() {
//  super({});
//  }
//  computeOutputShape(inputShape) { return []; }
//  call(inputx: any, kwargs) { return inputx.neg(); }
//  getClassName() { return 'Negative'; }
// }

// const inp = tf.tensor([-2, 1, 0, 5]);
// const out = new NegativeLayer().apply(inp);
// (out as any).print(); // [2, -1, 0, -5]

// The model of TensorFlow.js can be
// saved and loaded using the Layers API like so:
// const saveResult = await model.save('file://path/to/my-model');
// const model = await tf.loadLayersModel('file://path/to/my-model');

// Loading converted model
// const MODEL_PATH = 'assets/tensorflowjs/firstTensor/model.json';

const MODEL_PATH = 'assets/tensorflowjs/chatbot/model.json';

@Component({
  selector: 'app-quick-sample',
  templateUrl: './quick-sample.component.html',
  styleUrls: ['./quick-sample.component.scss'],
})
export class QuickSampleComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log('quick sample');
    // this.loadLayerModel();
    // const model = tf.sequential();
    // // console.log('model', model);
    // model.add(tf.layers.dense({
    //   units: 1,
    //   inputShape: [2]
    // }));

    // model.compile({
    //   loss: 'meanSquaredError',
    //   optimizer: 'adam'
    // });

    // const xs = tf.tensor2d([
    //   [0, 0], [0, 1], [1, 0], [1, 1]
    // ],
    // [4, 2]);
    // // console.log('xs', xs);
    // const ys = tf.tensor2d(
    //   [0, 1, 1, 0], [4, 1]
    // );
    // // console.log('ys', ys);

    // model.fit(xs, ys).then(() => {
    //   (model.predict(tf.tensor2d([[1, 0]], [1, 2])) as any).print();
    // });
  }

  async loadLayerModel() {
    // const testWord = this.stemmerService.stemmer('detestable');
    // console.log('stemmer test', testWord);
    // this.modelAnaconda = await tf.loadLayersModel(MODEL_PATH);
    // console.log('model chatbot', m);
    // const input = tf.tensor2d([[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
    //   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]], [1, 48]);
    // (m.predict(input) as any).print();
  }
}
