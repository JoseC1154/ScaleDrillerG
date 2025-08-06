#Overall App Structure
The application is built around a central Quiz component that adapts its behavior based on the selected QuizMode. The user makes their selections in the Settings component. Visual feedback is provided by the interactive Piano and Fretboard components, which dynamically display correct (Green), incorrect (red), and highlighted notes. 

#Global Settings
These settings are always available from the top bar and affect the entire app experience:

##Input Method (InputSelector.tsx):
Touch: Play notes by clicking/tapping on the on-screen instrument.
MIDI: Connect a MIDI keyboard or controller.
Mic: Use your computer's microphone or an external audio interface to sing or play an instrument. You can select the specific audio source device.

##Instrument (InstrumentSelector.tsx):
Piano: A responsive piano keyboard.
Guitar/Bass: A virtual fretboard.
Handedness: For Guitar and Bass, you can switch between a Right-handed or Left-handed layout.

##Diagnostics (GlobalSettingsModal.tsx):
Access the Input Tester to calibrate your microphone's noise gate or verify that your MIDI device is connected and sending signals correctly.

#Quiz Mode Breakdown

Time: All quizzes lose beats from the total beat allotment at the beat per minute rate. 
All questions are allotted 10 beats.
Beat award and penalty: beats awarded or lost per question.
Completion: Every quiz ends in a try again, quiz complete keep it up or congratulations message that states the
stats, and if the user is awarded an additional feature or level.

Here are the details for each quiz mode available in the app:

##Level 1: Foundational Skills

Memory Match
Objective: A sequence of notes is highlighted, first starts with one key, then two, three ,up to 8 keys. The user memorizes the sequence, then plays it back correctly. The user has to complete all scales in order to get to the next level. 
Settings: 
Key: Random
Scale: Random
Number of Questions: 40
Total Beats: 10
BPM: 70
Beat Award: 5
Beat Penalty: 5 
Level Awarded: No
Mode Awarded: Key Notes
Features Awarded: No
This mode helps to learn key names by highlighting sequences from random major scales to build initial memory, something like the Simon says game. 

Key Notes
Objective: A fast-paced drill. You're given a random scale and must find all of its notes. Once all the keys are satisfied, the next random scale has to be satisfied. If the beats finish the quiz is complete and the user can try again. 
Settings: 
Key: Random
Scale: Random
Number of Questions: 40
Total Beats: 50
BPM: 70
Beat Award: 5
Beat Penalty: 5 
Level Awarded: No
Mode Awarded: Scale Detective
Features Awarded: No
This mode helps to drill key names. 

Scale Detective
Objective: A two-part challenge. First, you're shown a scale with one note missing—find it. Second, identify the root key of the completed scale from a list of options.
Number of Questions: 40
Total Beats: 30
BPM: 70
Beat Award: 5
Beat Penalty: 5
Level Awarded: Yes
Mode Awarded: NO
Features Awarded: No
This mode helps to drill scales into memory.

##Level 2: Core Practice

Practice
Objective: Play the note corresponding to a specific scale degree (e.g., "the 5th of G Major").
Settings: Practice Keys (choose one or more), Scale Type (Major/Minor)
Total Beats: 30
BPM: 70
Beat Award: 5
Beat Penalty: 5 
This mode helps to learn XXXX something like the XXXX game.  

Time Attack
Objective: Answer 40 single-note degree questions on random scales, each with a 15-second time limit.
Settings: Instrument, Handedness. This mode has fixed rules for a consistent challenge
Total Beats: 30
BPM: 70
Beat Award: 5
Beat Penalty: 5 
This mode helps to learn XXXX something like the XXXX game. 

BPM Challenge
Objective: A survival mode where you answer questions against a metronome (BPM) that gets faster as you level up. Correct answers earn you 'beats' (health); wrong answers cost you beats.
Settings: Scale Type, Instrument, Handedness
Total Beats: 30
BPM: 70
Beat Award: 5
Beat Penalty: 5 
This mode helps to learn XXXX something like the XXXX game. 

Nashville Numbers
Objective: Identical to Practice, but prompts use the Nashville Numbering System (e.g., "b3" for a minor third) to test your knowledge of interval quality.
Settings: Practice Keys (choose one or more), Instrument, Handedness.
Total Beats: 30
BPM: 70
Beat Award: 5
Beat Penalty: 5 
This mode helps to learn XXXX something like the XXXX game.  

Degree Training
Objective: The most focused practice mode. It lets you select not only the keys to practice but also the specific scale degrees (e.g., only practice the 3rd and 7th degrees).
Settings: Practice Keys (multi-select), Practice Degrees (multi-select), Scale Type, Instrument, Handedness.
Total Beats: 30
BPM: 70
Beat Award: 5
Beat Penalty: 5 
This mode helps to learn XXXX something like the XXXX game. 

##Level 3: Advanced Theory

Intervals
Objective: Given a root note and an interval name (e.g., "Major 3rd"), play the note that completes the interval.
Settings: Practice Keys (to select root notes), Instrument, Handedness.
Total Beats: 30
BPM: 70
Beat Award: 5
Beat Penalty: 5 
This mode helps to learn XXXX something like the XXXX game. 

Chord Builder
Objective: Given a root note and chord type (Major or Minor), find all notes that form the chord.
Settings: Practice Keys (to select root notes), Chord Type (Major/Minor), Instrument, Handedness.
Total Beats: 30
BPM: 70
Beat Award: 5
Beat Penalty: 5 
This mode helps to learn XXXX something like the XXXX game. 

##Levels 4 & 5: Ultimate Challenges

Randomizer Roulette
Objective: A random mix of questions from all other single-note and multi-note modes to keep you on your toes.
Settings: Instrument, Handedness.
Total Beats: 30
BPM: 70
Beat Award: 5
Beat Penalty: 5 
This mode helps to learn XXXX something like the XXXX game. 
BPM Roulette
Objective: The ultimate challenge. Combines the random question style of Randomizer Roulette with the intense, ever-increasing timer mechanics of BPM Challenge.
Settings: Instrument, Handedness.
Total Beats: 30
BPM: 70
Beat Award: 5
Beat Penalty: 5 
This mode helps to learn XXXX something like the XXXX game.  

