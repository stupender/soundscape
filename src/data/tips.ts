// BEST PRACTICES — how to get a good voice recording on whatever you have.
// This file is DATA: each section is a tab in the Tips drawer.
//
// Write a tip as you'd say it to a student in the room: one thing to do, and
// why, in a sentence or two.

export interface Tip {
  title: string;
  body: string;
}

export interface TipSection {
  id: string;
  name: string;
  intro: string;
  tips: Tip[];
}

export const TIPS: TipSection[] = [
  {
    id: 'headphones',
    name: 'Headphones',
    intro: 'The one rule: the soundscape goes in your ears, not into the room. Then the voice track is only your voice.',
    tips: [
      { title: 'Why they matter', body: 'Without headphones the mic hears the soundscape too, and it\'s baked into your voice track. You can\'t rebalance it afterwards, and it doubles up when the two tracks are mixed.' },
      { title: 'Wired is best', body: 'Wired headphones have no delay, so you sing in time with what you hear. Any pair will do, even the ones that came with a phone.' },
      { title: 'Bluetooth turns into a phone call', body: 'While the mic is on, an iPhone switches AirPods and other Bluetooth headphones into call mode: the soundscape drops to thin, mono call quality, and the voice may be recorded through the headphones\' mic instead of the phone\'s. For recording, use wired headphones (with an adapter if needed). Bluetooth is fine for just listening.' },
      { title: 'Keep them quiet', body: 'Closed headphones (over-ear, sealed) leak less than open ones. Keep the level comfortable: if you can hear the soundscape from a metre away, the mic can too.' },
      { title: 'Choose a different mic', body: 'Headphones with a mic built in don\'t have to be the mic. Under Input, choose the phone\'s or laptop\'s own mic, or your USB mic, and leave the headphones for listening (Output).' },
    ],
  },
  {
    id: 'phone',
    name: 'Phone',
    intro: 'A phone\'s mic is better than people think. It does need to keep still, at the right distance, pointing the right way.',
    tips: [
      { title: 'Find the mic', body: 'On an iPhone the main mic is on the bottom edge, by the charging port. Sing toward that edge, not at the screen. Not sure? Scratch lightly around the edges with a fingernail and watch the meter jump.' },
      { title: 'A hand\'s width away', body: 'Keep about 15–30 cm (6–12 in) between your mouth and the phone. Closer adds boom and pops; further adds the room.' },
      { title: 'Don\'t hold it, set it down', body: 'A phone in your hand picks up every shift of your fingers as a rumble. Stand it on a soft surface (a folded towel or a book on a cushion) or in a stand, at mouth height.' },
      { title: 'Sing past it, not into it', body: 'Aim just to the side of the mic, not straight at it. Plosives (p, b) and breath blow past it instead of thumping into it.' },
      { title: 'Silence the phone', body: 'Turn on Do Not Disturb or Airplane Mode (keep Wi-Fi if you need it). A notification chime in the middle of a take is heartbreaking.' },
    ],
  },
  {
    id: 'laptop',
    name: 'Laptop',
    intro: 'A MacBook\'s mics are good, but they sit right beside the keyboard and fans, and they hear everything on the desk.',
    tips: [
      { title: 'Find the mics', body: 'On most MacBooks the mics are near the top of the keyboard or by the speaker grilles. Tap gently around the edge of the keyboard deck and watch the meter: where it jumps, that\'s where to sing.' },
      { title: 'Hands off the desk', body: 'The laptop hears every tap through the table. Start recording with the space bar, then sit back and leave the desk alone.' },
      { title: 'Lift it up', body: 'Set the laptop on a stack of books so the mics are nearer your mouth and you can sit or stand up straight. Your voice will open up.' },
      { title: 'Keep it cool and quiet', body: 'Close other apps so the fans stay off. Fan noise is a steady hiss the mic hears all the way through.' },
    ],
  },
  {
    id: 'ipad',
    name: 'iPad',
    intro: 'An iPad is a lovely recorder: a big screen for the pads, and good mics. Mind where they are.',
    tips: [
      { title: 'Find the mics', body: 'Most iPads have their mics along the top edge, near the camera, when held upright. Sing toward that edge, about a hand\'s width away.' },
      { title: 'Stand it up', body: 'Use a case that folds into a stand, or lean it on a music stand. Keep your hands off it while you sing.' },
      { title: 'Use the pads', body: 'The number pads are made for an iPad: hold to record, tap to play. With a keyboard case, the number keys work too.' },
    ],
  },
  {
    id: 'usb',
    name: 'USB mic & interface',
    intro: 'A real microphone, through USB or an audio interface, is the biggest step up in sound.',
    tips: [
      { title: 'Pick it under Input', body: 'Plug it in, then choose it from the Input list in the Voice panel. If it doesn\'t appear, unplug it and plug it in again; the list updates by itself.' },
      { title: 'Which input?', body: 'If your interface has two inputs, choose the one your mic is plugged into (Input 1 or Input 2). The meter shows when you\'ve found it.' },
      { title: 'Set the gain on the device', body: 'Turn the gain knob on the mic or interface while you sing your loudest phrase. Aim for the meter to peak in the coral zone, never in the red. The app\'s Trim is only for fine adjustment.' },
      { title: 'Turn off direct monitoring echo', body: 'If your interface lets you hear yourself directly, leave the app\'s Input monitoring off, or you\'ll hear yourself twice.' },
      { title: 'Phantom power', body: 'Condenser mics need 48V phantom power. Look for the 48V button on the interface. Dynamic mics (like an SM58) don\'t need it.' },
    ],
  },
  {
    id: 'room',
    name: 'The room',
    intro: 'The room is part of the recording. Soft rooms sound close and warm; bare rooms ring.',
    tips: [
      { title: 'Soft things around you', body: 'Curtains, a bed, a sofa, a full bookshelf. A walk-in closet full of clothes is a famously good vocal booth.' },
      { title: 'Turn away from bare walls', body: 'Face into the room, or toward something soft. A bare wall right behind the mic sends your voice straight back into it.' },
      { title: 'Listen for hum', body: 'Fridges, air conditioning, fans and lights hum. Switch off what you can for the length of a take.' },
      { title: 'A T-shirt pop filter', body: 'No pop filter? Stretch a thin T-shirt or a bit of fabric across a wire hanger or an embroidery hoop, between your mouth and the mic. Pops and breath stay out; the voice comes through. (The Steve Lacy trick: he made early records on an iPhone.)' },
      { title: 'Record ten seconds of silence', body: 'Before you sing, stay still for a moment. That "room tone" is what clean-up tools use to learn what to take away.' },
    ],
  },
  {
    id: 'outdoors',
    name: 'Outdoors',
    intro: 'Recording outside is beautiful when it works. Wind is the enemy.',
    tips: [
      { title: 'Get out of the wind', body: 'Even a light breeze on the mic sounds like thunder. Stand behind a wall, a tree, a car or your own body, with the mic facing away from the wind.' },
      { title: 'A sock is a windscreen', body: 'A fuzzy sock or a bit of foam over the phone\'s mic end cuts wind noise a lot. It\'s what the "dead cat" fur covers on film sets do.' },
      { title: 'Let the place in, on purpose', body: 'Birds, water and wind are lovely as a soundscape. Turn the app\'s nature layers down and let the real ones be the bed.' },
      { title: 'Low cut afterwards', body: 'The Low cut switch on a take (a high-pass filter at 80 Hz) removes the rumble wind and traffic leave behind.' },
    ],
  },
  {
    id: 'before',
    name: 'Before you press record',
    intro: 'Thirty seconds of setting up saves a take.',
    tips: [
      { title: 'Set your level', body: 'Press Auto beside Trim and sing the loudest phrase of the piece for five seconds; the trim is set for you. Or sing and watch the meter yourself: the coral zone is the sweet spot, red means too loud.' },
      { title: 'Check the space for your voice', body: 'The "space" picture shows where the soundscape sits (grey) and where your voice sits (coral). If they pile up in the same place, turn down the layers that crowd you.' },
      { title: 'Settle first', body: 'Start recording, then take a breath and let a few seconds of soundscape pass before you sing. You can trim the start later.' },
    ],
  },
];
