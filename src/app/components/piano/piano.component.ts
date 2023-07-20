import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MajorChords } from 'src/app/enums/MajorChords';
import { NoteMapping } from 'src/app/enums/NoteMapping';
import { AudioService } from 'src/app/services/audio.service';

const KEY_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

@Component({
  selector: 'app-piano',
  templateUrl: './piano.component.html',
  styleUrls: ['./piano.component.scss']
})
export class PianoComponent implements OnInit, OnDestroy {

  pianoConfigForm!: FormGroup;

  chordDisplayInterval: any;
  currentChord = '';

  constructor(
    private _audioService: AudioService
  ) { }

  ngOnInit(): void {
    this.listenToKeysPressed();
    this.createPianoConfigForm();
  }

  ngOnDestroy(): void {
    this.stopChords();
  }

  createPianoConfigForm() {
    this.pianoConfigForm = new FormGroup({
      noOfOctaves: new FormControl(3, [Validators.required]),
      chordChangeInterval: new FormControl(1, [Validators.required, Validators.min(0.1), Validators.max(10)])
    })
    this.pianoConfigForm.valueChanges.subscribe((value) => {
      // console.log(value);
    })
  }

  octavesCountChange() {
    let value = this.pianoConfigForm.get('noOfOctaves')?.value;
    this.pianoConfigForm.get('noOfOctaves')?.setValue(parseInt(value));
  }

  numSequence(n: number): Array<number> {
    return new Array(n).fill(1).map((_, i) => i + 1)
  }

  listenToKeysPressed() {
    const keyboard = document.getElementById("keyboard")!;

    document.addEventListener("mousedown", (e: any) => {
      // console.log(e);
      if (!e) return;
      if (e.target.nodeName.toLowerCase() !== 'li') return;
      const key = e.target.attributes.getNamedItem('note').value;
      const octaveOffset = e.target.attributes.getNamedItem('octaveOffset').value;
      // console.log(key);
      e.target.classList.add("pressed");
      this._audioService.playKey(key, octaveOffset);
    });

    keyboard.addEventListener("mouseup", (e: any) => {
      // console.log(e);
      if (!e) return;
      if (e.target.nodeName.toLowerCase() !== 'li') return;
      const key = e.target.attributes.getNamedItem('note').value;
      const octaveOffset = e.target.attributes.getNamedItem('octaveOffset').value;
      // console.log(key);
      e.target.classList.remove("pressed");
      this._audioService.stopKey(key, octaveOffset);
    });
  }

  startChords() {
    if (this.chordDisplayInterval) return;

    let chordDisplayElement = document.getElementById("chordDisplay");
    let intervalValue = this.pianoConfigForm.get('chordChangeInterval')?.value;

    if (chordDisplayElement) {
      chordDisplayElement.classList.add('fadeChangeAnimation');
      chordDisplayElement.style.animationDuration = intervalValue + 's';
    }

    this.playChord();
    this.chordDisplayInterval = setInterval(this.playChord.bind(this), intervalValue * 1000);
  }

  playChord() {
    let intervalValue = this.pianoConfigForm.get('chordChangeInterval')?.value;
    while (true) {
      let [chord, value] = this.getRandomChord();
      if (chord == this.currentChord) continue;

      this.currentChord = chord + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + value;
      // console.log(value);
      let firstKey = value[0];
      value.split('-').forEach((key) => {
        let offset = 0;
        if (KEY_ORDER.indexOf(key[0]) < KEY_ORDER.indexOf(firstKey)) offset = 1;
        this._audioService.playKey(key, 4 + offset)
        // console.log(key);
        key = NoteMapping[key];
        let elements = document.querySelectorAll('[note="' + key + '"]')
        // console.log(elements);
        elements.item(0 + offset).classList.add("pressed")

        this._audioService.stopKey(key, 4 + offset)
        setTimeout(() => {
          elements.item(0 + offset).classList.remove("pressed")
        }, intervalValue * 900)
      })
      break;
    }
  }

  getRandomChord() {
    const enumKeys = Object.keys(MajorChords)
    const enumValues = Object.values(MajorChords)
    const randomIndex = Math.floor(Math.random() * enumKeys.length)
    const randomEnumKey = enumKeys[randomIndex]
    const randomEnumValue = enumValues[randomIndex]
    return [randomEnumKey, randomEnumValue];
  }

  stopChords() {
    if (this.chordDisplayInterval) {
      clearInterval(this.chordDisplayInterval);
      this.chordDisplayInterval = null;
    }
    this.currentChord = '';
  }

}
