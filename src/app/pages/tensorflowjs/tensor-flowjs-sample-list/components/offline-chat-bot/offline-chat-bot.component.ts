import { Component, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { StemmerService } from '../../../../../service/stemmer.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IntentI } from '../../../interfaces/intent-interface';

const INTENTS_URL = 'assets/tensorflowjs/chatbot/intents.json';

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
