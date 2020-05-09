import { Component, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { StemmerService } from '../../../../../service/stemmer.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IntentI } from '../../../interfaces/intent-interface';
import _ from 'lodash';

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
const INTENTS_URL = 'assets/tensorflowjs/chatbot/intents.json';
console.log('MODEL_PATH', MODEL_PATH);

@Component({
  selector: 'app-offline-chat-bot',
  templateUrl: './offline-chat-bot.component.html',
  styleUrls: ['./offline-chat-bot.component.scss'],
})
export class OfflineChatBotComponent implements OnInit {
  intents: IntentI[];
  words: Array<string> = []; // pattern
  classes: Array<string> = []; // tag
  documents: any = []; // combination between patterns and intents,  (['How', 'are', 'you'], 'greeting'),
  training: any = [];
  trainX: any = [];
  trainY: any = [];
  model: any;
  modelAnaconda: any;
  modelFitComplete = false;

  conversations: any = [{}];
  question = '';

  constructor(private readonly stemmerService: StemmerService,
              private http: HttpClient) { }

  ngOnInit() {
    // Load intents
    // if (!sessionStorage.getItem(tfModel)) {
      this.getIntents().subscribe((data: any) => {
        this.intents = data.intents as IntentI[];
        console.log('intents', this.intents);
        this.initializeTrainingData();
      });
    // } else {
    //   this.model = JSON.parse(sessionStorage.getItem(tfModel));
    //   console.log('model loaded', this.model);
    // }

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

  onSubmit() {
    console.log('submitted', this.question);


    // Transform question to input
    const xs = this.transformQuestionToTensor();
    console.log('xs', xs);

    // Make prediction
    const prediction = this.model.predict(tf.tensor2d(xs, [1, xs.length]));
    const result = prediction.dataSync();
    console.log('result', result, this.classes);

    // Find the question class
    const maxValue = Math.max(...result);
    const maxValueIndex = result.indexOf(maxValue);

    console.log('the class is', this.classes[maxValueIndex]);

    const predictedClass = this.classes[maxValueIndex];

    // Get responses
    let response = '';
    for (const intent of this.intents) {
      if (intent.tag === predictedClass) {
        // Loop on responses
        // Make a random choice of response
        const responseLen = intent.responses.length;
        response = intent.responses[Math.floor(Math.random() * Math.floor(responseLen))];
      }
    }

    this.conversations.push({
      question: this.question,
      answer: response
    });

    this.question = '';
  }

  transformQuestionToTensor() {
    // list of tokenized words for the pattern
    let patternWords = this.wordTokenize(this.question);
    // initialize our bag of words
    const bag = [];

    patternWords = patternWords.map(pWord => {
      // Remove non alpha numeric characters
      pWord = pWord.replace(/[\W+]+/g, '');
      // To lower case
      pWord = pWord.toLowerCase();
      return this.stemmerService.stemmer(pWord);
    });

    for (const w of this.words) {
      const wInPatternWords = patternWords.some(pW => {
        return pW === w;
      });
      if (wInPatternWords) {
        bag.push(1);
      } else {
        bag.push(0);
      }
    }

    return bag;
  }

  initializeTrainingData() {
    // Classify words
    this.classifyWords();

    // Create training data
    this.createTrainingData();

    // Shuffle array of objects
    this.training = this.getShuffledArr(this.training);

    console.log('training', this.training);
    // Split input and target
    this.training.forEach(tData => {
      this.trainX.push(tData.input);
      this.trainY.push(tData.target);
    });

    this.createModel();
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

  getIntents(): Observable<any> {
    return this.http.get(INTENTS_URL);
  }

  classifyWords() {
    for (const intent of this.intents) {
      for (const pattern of intent.patterns) {
        const w = this.wordTokenize(pattern);
        this.words.push(...w);

        const d = [w, intent.tag];
        this.documents.push(d);

        const inClassesAlready = this.classes.some(c => {
          return c === intent.tag;
        });
        if (!inClassesAlready) {
          this.classes.push(intent.tag);
        }
      }
    }
    this.stemWords();

    // Remove duplicate
    this.words = this.words.filter((v, i, a) => a.indexOf(v) === i);
    console.log('words', this.words);
    console.log('classes', this.classes);
    console.log('documents', this.documents);
  }

  wordTokenize(pattern): Array<string> {
    return pattern.split(' ');
  }

  stemWords() {
    this.words = this.words.map(word => {
      // Remove non alpha numeric characters
      word = word.replace(/[\W+]+/g, '');
      // To lower case
      word = word.toLowerCase();
      return this.stemmerService.stemmer(word);
    });
  }

  createTrainingData() {
    for (const doc of this.documents) {
      // initialize our bag of words
      const bag = [];
      // list of tokenized words for the pattern
      let patternWords = doc[0];
      patternWords = patternWords.map(pWord => {
        // Remove non alpha numeric characters
        pWord = pWord.replace(/[\W+]+/g, '');
        // To lower case
        pWord = pWord.toLowerCase();
        return this.stemmerService.stemmer(pWord);
      });
      console.log('pattern words', patternWords);

      for (const w of this.words) {
        const wInPatternWords = patternWords.some(pW => {
          return pW === w;
        });
        if (wInPatternWords) {
          bag.push(1);
        } else {
          bag.push(0);
        }
      }

      const outputRow = [];
      for (const r of this.classes) {
        outputRow.push(0);
      }
      outputRow[this.classes.indexOf(doc[1])] = 1;
      console.log('outpur row', bag, outputRow);

      this.training.push({
        input: bag,
        target: outputRow
      });
    }
  }

  getShuffledArr(arr) {
    const newArr = arr.slice();
    for (let i = newArr.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
    }
    return newArr;
  }

  createModel() {
    this.model = tf.sequential();
    // console.log('model', model);
    this.model.add(tf.layers.dense({
      units: 128,
      inputShape: [this.trainX[0].length],
      activation: 'relu'
    }));

    this.model.add(tf.layers.dropout({
      rate: 0.5
    }));

    this.model.add(tf.layers.dense({
      units: 64,
      activation: 'relu'
    }));

    this.model.add(tf.layers.dropout({
      rate: 0.5
    }));

    this.model.add(tf.layers.dense({
      units: this.trainY[0].length, activation: 'softmax'
    }));

    this.model.compile({
      loss: 'categoricalCrossentropy',
      optimizer: 'adam', // works than sgd
      metrics: ['accuracy']
    });

    // let xs = tf.tensor2d([
    //   [0, 0], [0, 1], [1, 0], [1, 1]
    // ],
    // [4, 2]);
    // console.log('xs', xs);
    const xs = tf.tensor2d(this.trainX, [this.trainX.length, this.trainX[0].length]);


    // const ys = tf.tensor2d(
    //   [0, 1, 1, 0], [4, 1]
    // );
    // console.log('ys', ys);
    const ys = tf.tensor2d(this.trainY, [this.trainY.length, this.trainY[0].length]);
    console.log('trainX', this.trainX.length, this.trainX[0].length, this.trainX);
    console.log('trainY', this.trainY.length, this.trainY[0].length, this.trainY);
    // Fit the model
    // this.model.fit(np.array(train_x), np.array(train_y), epochs=200, batch_size=5, verbose=1)

    this.model.fit(xs, ys, {epochs: 200, batch_size: 7, verbose: 1}).then(() => {
      console.log('modeling fit complete', this.model);
      // Save the model in session storage
      this.modelFitComplete = true;
      // sessionStorage.setItem(tfModel, JSON.stringify(this.model));
      // (this.model.predict(tf.tensor2d(this.trainX[0], [1, this.trainX[0].length])) as any).print();
    });
  }

}
