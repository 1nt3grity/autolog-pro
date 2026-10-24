/**
 * Diagnostic knowledge base: common symptoms with guided checklists,
 * plus a dashboard warning-light reference.
 * Purely informational guidance the owner works through themselves.
 */

export const SYMPTOM_CATEGORIES = [
  { id: 'brakes', label: 'Brakes' },
  { id: 'engine', label: 'Engine & Performance' },
  { id: 'electrical', label: 'Electrical & Starting' },
  { id: 'cooling', label: 'Cooling & Heating' },
  { id: 'suspension', label: 'Steering & Suspension' },
  { id: 'tires', label: 'Tires & Alignment' },
  { id: 'drivetrain', label: 'Transmission & Drivetrain' },
  { id: 'fluids', label: 'Leaks & Fluids' },
  { id: 'climate', label: 'Air Conditioning' }
];

export const SEVERITY_META = {
  high: { label: 'Act now', tone: 'text-red-600 bg-red-50 border-red-200' },
  medium: { label: 'Check soon', tone: 'text-amber-700 bg-amber-50 border-amber-200' },
  low: { label: 'Monitor', tone: 'text-slate-600 bg-slate-100 border-slate-200' }
};

export const SYMPTOMS = [
  {
    id: 'brakes-squeal',
    name: 'Brakes squeal or grind when stopping',
    category: 'brakes',
    severity: 'high',
    icon: 'disc',
    summary:
      'A high-pitched squeal usually means the pads are near the end of their life. A grinding metal-on-metal sound means the friction material is gone and the backing plate is contacting the rotor.',
    causes: [
      'Brake pads worn to the squealer tab',
      'Glazed or contaminated pad surface',
      'Worn, scored or warped rotors',
      'Dry or stuck caliper slide pins',
      'Cheap pad compound that squeals cold'
    ],
    steps: [
      'Note when it happens: cold only, light braking, or every stop.',
      'Look through the wheel spokes at pad thickness - under 3 mm means replace now.',
      'Check the rotor face for deep grooves or a lip on the outer edge.',
      'Jack the car safely and spin each wheel - it should turn with light drag, not scrape.',
      'Compare inner and outer pads - uneven wear points to a sticking caliper.',
      'Pull the wheel and measure pad and rotor thickness against your car specs.',
      'If pads are low, plan pads and rotors together and keep the receipt for warranty.'
    ],
    red_flag: 'Grinding plus a soft pedal, a pull to one side, or a burning smell: park the car and have it towed.'
  },
  {
    id: 'brakes-soft-pedal',
    name: 'Brake pedal feels soft, spongy or sinks',
    category: 'brakes',
    severity: 'high',
    icon: 'alert',
    summary:
      'The pedal should feel firm and hold pressure. A pedal that sinks toward the floor usually means air in the system or a fluid leak, which is a safety issue.',
    causes: [
      'Air in the hydraulic system',
      'Leaking brake line, hose or caliper',
      'Failing master cylinder',
      'Low brake fluid from worn pads or a leak',
      'Boiled fluid from repeated hard stops'
    ],
    steps: [
      'Park on level ground and check the brake fluid reservoir level.',
      'Look behind each wheel and under the car for wet, oily residue near the lines and calipers.',
      'With the engine off, pump the pedal a few times then hold firm pressure for 30 seconds.',
      'If the pedal creeps down while held, the master cylinder or a line is suspect.',
      'Check for a damp or swelling rubber brake hose where it meets the wheel.',
      'Do not drive until the leak source is found and the system is bled.'
    ],
    red_flag: 'Any pedal that reaches the floor is unsafe to drive. Have the car towed and repaired.'
  },
  {
    id: 'shudder-braking',
    name: 'Steering wheel shudders when braking',
    category: 'brakes',
    severity: 'medium',
    icon: 'disc',
    summary:
      'A shudder under braking is usually uneven rotor thickness or runout, and it often gets worse the longer it is ignored.',
    causes: [
      'Warped or unevenly worn rotors',
      'Wheel bearing play',
      'Loose or worn suspension bushings',
      'Improperly torqued lug nuts after a tire service'
    ],
    steps: [
      'Note the speed range where it shudders - typically 40 to 70 mph.',
      'Check that lug nuts are torqued evenly to spec with a torque wrench.',
      'Inspect rotors for blue heat spots or heavy scoring on the face.',
      'Grab each front wheel at 12 and 6 o\u2019clock and rock it to check bearing play.',
      'Inspect control arm and tie rod bushings for cracks or movement.',
      'Plan rotor replacement or resurfacing if the rotors measure out of spec.'
    ],
    red_flag: 'Shudder with a pull to one side, or a pedal that pulses hard, should be inspected immediately.'
  },
  {
    id: 'check-engine-light',
    name: 'Check engine light came on',
    category: 'engine',
    severity: 'medium',
    icon: 'gauge',
    summary:
      'The engine computer logged a fault code. A steady light is usually an emissions or sensor issue; a flashing light means active misfire that can damage the catalytic converter.',
    causes: [
      'Loose or faulty gas cap',
      'Failing oxygen sensor or mass airflow sensor',
      'Ignition coil, plug or plug wire misfire',
      'Vacuum leak',
      'Catalytic converter efficiency fault'
    ],
    steps: [
      'Check whether the light is steady or flashing - never ignore a flashing light.',
      'Tighten the gas cap until it clicks, then note the mileage and date.',
      'Scan for stored and pending codes with a reader and write down the exact numbers.',
      'Search the code for your make, model and year rather than assuming a part.',
      'Clear only after recording the codes, then see which ones return.',
      'Log the scan as a service record so you have a history if the fault recurs.'
    ],
    red_flag: 'A flashing check engine light, or a light with rough running or a loss of power: stop driving and diagnose.'
  },
  {
    id: 'rough-idle-shake',
    name: 'Engine idles rough or shakes at a stop',
    category: 'engine',
    severity: 'medium',
    icon: 'activity',
    summary:
      'A rough or loping idle points to a misfire or an air and fuel mixture problem rather than a mechanical failure in most cases.',
    causes: [
      'Worn spark plugs or a failing ignition coil',
      'Dirty throttle body or idle air control valve',
      'Vacuum or intake leak',
      'Failing engine mount',
      'Clogged fuel injectors'
    ],
    steps: [
      'Note whether it happens cold, warm, in gear, or only with the AC on.',
      'Scan for misfire codes and note which cylinder or cylinders are flagged.',
      'Inspect plugs for wear, oil fouling or an incorrect gap.',
      'Check for a cracked or disconnected vacuum hose in the engine bay.',
      'Clean the throttle body and mass airflow sensor with the correct cleaner only.',
      'If a single cylinder misfires, swap that coil to another cylinder and rescan to see if the code follows.'
    ],
    red_flag: 'Rough idle with a flashing check engine light can dump raw fuel into the exhaust. Diagnose before driving far.'
  },
  {
    id: 'no-start',
    name: 'Car will not start',
    category: 'electrical',
    severity: 'high',
    icon: 'zap',
    summary:
      'Separate the symptom first: no sound at all, a single click, rapid clicking, or a healthy crank that never fires. Each points to a different system.',
    causes: [
      'Discharged or failed battery',
      'Corroded or loose battery terminals',
      'Failed starter motor or solenoid',
      'Faulty ignition switch or anti-theft fault',
      'No fuel pressure or no spark'
    ],
    steps: [
      'Turn on the headlights and note whether they are bright, dim, or dead.',
      'Try the dash lights and horn - a weak horn with dim lights points to the battery.',
      'Inspect battery terminals for white or green corrosion and tighten them.',
      'Listen for one loud click (starter or solenoid) versus rapid clicking (low voltage).',
      'If it cranks normally but will not fire, check the fuel pump prime sound at key-on.',
      'Try a jump start record the result - if it starts and runs, charge and test the battery.'
    ],
    red_flag: 'If you smell fuel while cranking, stop, step away and let the area ventilate before continuing.'
  },
  {
    id: 'battery-charging-light',
    name: 'Battery or charging light on while driving',
    category: 'electrical',
    severity: 'high',
    icon: 'battery',
    summary:
      'This light means the car is running on stored battery power only. You have a limited distance before systems start shutting down.',
    causes: [
      'Failed alternator or voltage regulator',
      'Broken or glazed serpentine belt',
      'Loose or corroded charging cable',
      'Worn alternator pulley or tensioner'
    ],
    steps: [
      'Turn off everything you can: AC, rear defroster, stereo, seat heaters.',
      'Head straight to a safe location or a shop rather than continuing your trip.',
      'Check belt condition and tension - look for glazing, cracks or a missing rib.',
      'Inspect the battery terminals and the main ground strap for corrosion.',
      'With the engine running, have the charging voltage measured across the battery.',
      'A reading well below about 13.5 volts points to the alternator or regulator.'
    ],
    red_flag: 'Power steering, brakes or lighting can fade as voltage drops. Do not drive at night or on the highway.'
  },
  {
    id: 'overheating',
    name: 'Temperature gauge climbs or overheats',
    category: 'cooling',
    severity: 'high',
    icon: 'thermometer',
    summary:
      'Overheating can warp a cylinder head in minutes. Stop driving as soon as it is safe and let the engine cool completely before opening anything.',
    causes: [
      'Low coolant from a leak',
      'Failed thermostat',
      'Cooling fan not running',
      'Failed water pump',
      'Radiator cap that will not hold pressure',
      'Air pocket after a recent coolant service'
    ],
    steps: [
      'Pull over safely, shut the engine off and open the hood to let heat escape.',
      'Wait at least 30 minutes before touching the radiator or coolant hoses.',
      'Look for a sweet smell, white steam, or green, orange or pink fluid under the car.',
      'Once cool, top up the coolant reservoir with the correct type for your car.',
      'Restart and watch the gauge - look for a fan that never turns on at temperature.',
      'Check for a coolant smell or coolant residue at the water pump, hoses, or heater core.'
    ],
    red_flag: 'If the gauge reaches the red zone, stop driving immediately. Towing is cheaper than a head gasket.'
  },
  {
    id: 'no-heat',
    name: 'Heater blows cold air',
    category: 'cooling',
    severity: 'low',
    icon: 'wind',
    summary:
      'No cabin heat is usually a cooling system problem, and it is often the first sign of low coolant before the gauge ever moves.',
    causes: [
      'Low coolant level',
      'Air trapped in the cooling system',
      'Stuck thermostat',
      'Clogged heater core',
      'Blend door actuator failure'
    ],
    steps: [
      'Check the coolant level with the engine stone cold.',
      'Confirm the temperature gauge reaches normal operating range.',
      'With the engine warm, feel both heater hoses at the firewall - both should be hot.',
      'If one hose is hot and the other cold, suspect a clogged heater core.',
      'Check whether the air changes temperature when you move the blend control.',
      'Top up, burp the system, then recheck after a drive.'
    ],
    red_flag: 'If the heater fails at the same time the temperature gauge climbs, stop driving and treat it as an overheating issue.'
  },
  {
    id: 'ac-warm',
    name: 'Air conditioning blows warm',
    category: 'climate',
    severity: 'low',
    icon: 'wind',
    summary:
      'AC performance drops gradually with a small refrigerant leak, and more suddenly when a compressor or relay fails.',
    causes: [
      'Low refrigerant from a slow leak',
      'Failed compressor clutch or relay',
      'Blend door stuck between hot and cold',
      'Clogged cabin air filter restricting airflow',
      'Condenser blocked by debris'
    ],
    steps: [
      'Run the AC on max cold and recirculate, and note the vent temperature.',
      'Watch and listen for the compressor clutch engaging under the hood.',
      'Replace the cabin air filter and compare airflow before and after.',
      'Rinse leaves and bugs out of the condenser with gentle water.',
      'Check that both radiator fans run with the AC on.',
      'Take it in for a sealed system pressure and leak test rather than adding refrigerant repeatedly.'
    ],
    red_flag: 'No safety risk, but repeated top-ups without a leak repair always come back. Find the leak once.'
  },
  {
    id: 'shake-at-speed',
    name: 'Steering wheel shakes at highway speed',
    category: 'suspension',
    severity: 'medium',
    icon: 'activity',
    summary:
      'A shimmy at a specific speed band is almost always an imbalance or a wheel problem, while a constant shake can point to worn parts.',
    causes: [
      'Wheel balance weights thrown off',
      'Bent wheel or a bulge in a tire sidewall',
      'Worn tie rod ends or ball joints',
      'Worn wheel bearing',
      'Tire separation'
    ],
    steps: [
      'Note the exact speed the shake starts and stops at.',
      'Inspect each tire for bulges, flat spots and uneven tread wear.',
      'Check and set tire pressures cold against the door-jamb sticker.',
      'Look for missing or fresh wheel weight marks on the rims.',
      'Rock each front wheel at 12 and 6, then 3 and 9, to feel for play.',
      'Rotate front to rear and retest to see whether the shake follows the wheel.'
    ],
    red_flag: 'A violent shake plus a visible tire bulge means the tire can fail. Replace it before highway driving.'
  },
  {
    id: 'pulls-one-side',
    name: 'Car pulls to one side or tires wear unevenly',
    category: 'tires',
    severity: 'medium',
    icon: 'disc',
    summary:
      'Alignment moves out of spec after potholes and curb hits. Uneven wear costs a set of tires if it is left alone.',
    causes: [
      'Alignment knocked out of spec',
      'Uneven tire pressures',
      'Worn or seized suspension components',
      'Dragging brake caliper',
      'Bent wheel or worn wheel bearing'
    ],
    steps: [
      'Set all four tire pressures cold and recheck the pull on a level road.',
      'Compare tread depth across the inner, center and outer edges of each tire.',
      'Check for cupping or feathered tread pattern along the ribs.',
      'Note whether the pull is constant or only under braking.',
      'Check for a wheel that is noticeably hotter than the others after a drive.',
      'Get an alignment printout and keep it with your records for warranty claims.'
    ],
    red_flag: 'A sudden pull after an impact should be inspected before any highway trip.'
  },
  {
    id: 'belt-squeal',
    name: 'Squealing or squeaking from the engine bay',
    category: 'engine',
    severity: 'medium',
    icon: 'activity',
    summary:
      'A squeal on startup is usually the accessory belt slipping. Left alone it can snap, and on many cars that also drives the water pump.',
    causes: [
      'Glazed, cracked or stretched belt',
      'Worn automatic tensioner',
      'Misaligned or failing idler pulley',
      'Failing pulley bearing',
      'Fluid contamination from a leaking seal'
    ],
    steps: [
      'Note whether the noise is on cold start, at idle, or only when turning the wheel.',
      'Inspect the belt for cracks, glazing, missing ribs or fraying.',
      'Check belt tension and whether the tensioner moves smoothly through its range.',
      'Spin each idler and tensioner pulley by hand - listen for grit or roughness.',
      'Look for oil or coolant misting onto the belt path.',
      'Replace the belt and tensioner together if either is worn.'
    ],
    red_flag: 'A snapped belt can take out the water pump and leave you stranded. Replace a noisy belt now.'
  },
  {
    id: 'fluid-leak',
    name: 'Fluid puddle or drips under the car',
    category: 'fluids',
    severity: 'medium',
    icon: 'droplet',
    summary:
      'The color of the fluid identifies the system, and that tells you how urgent the repair is.',
    causes: [
      'Engine oil from the pan, valve cover or rear seal',
      'Coolant from hoses, radiator or water pump',
      'Transmission fluid from the pan or a cooler line',
      'Brake fluid from a line or caliper',
      'Power steering fluid from a rack or hose',
      'Condensation from the AC (normal)'
    ],
    steps: [
      'Park on clean cardboard and mark where the car sits to locate the drips.',
      'Identify the fluid by color: amber is oil, green orange or pink is coolant, red is transmission, clear water is AC condensation.',
      'Touch the fluid and compare the texture - oil feels slick, coolant feels thin and sweet.',
      'Check all reservoir levels and top up with the correct fluid type only.',
      'Note the exact spot below the car to narrow down which corner is leaking.',
      'Track how much is lost over a week so a shop can judge the urgency.'
    ],
    red_flag: 'Brake fluid, and any leak that grows quickly, should be repaired before the next long drive.'
  },
  {
    id: 'transmission-slip',
    name: 'Transmission slips, flares or shifts hard',
    category: 'drivetrain',
    severity: 'high',
    icon: 'gauge',
    summary:
      'Delayed engagement, revving without acceleration, or a hard clunk between gears points to the transmission or its fluid and controls.',
    causes: [
      'Low or burnt transmission fluid',
      'Solenoid or valve body fault',
      'Worn clutch packs',
      'Failing torque converter',
      'Software calibration that needs an update'
    ],
    steps: [
      'Check the transmission fluid level and color at the correct temperature.',
      'Note the exact conditions: cold or hot, which gear, light or heavy throttle.',
      'Smell the fluid - a burnt smell means heat damage has already happened.',
      'Look for transmission fault codes even without a warning light.',
      'Avoid towing or hard acceleration until it is inspected.',
      'Follow the factory fluid and filter interval exactly for your make and model.'
    ],
    red_flag: 'A transmission that will not engage at all, or that slips badly in traffic, is unsafe. Have it towed.'
  }
];

export const WARNING_LIGHT_COLORS = {
  red: { label: 'Stop now', tone: 'text-red-600 bg-red-50 border-red-200', dot: 'bg-red-500' },
  amber: { label: 'Service soon', tone: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  green: { label: 'Normal / working', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' }
};

export const WARNING_LIGHTS = [
  {
    id: 'oil-pressure',
    name: 'Oil pressure',
    color: 'red',
    meaning: 'Engine oil pressure has dropped below the safe minimum while the engine is running.',
    action: 'Pull over safely and shut the engine off. Check the oil level once cool. Do not restart with low pressure.',
    urgency: 'Stop immediately'
  },
  {
    id: 'coolant-temp',
    name: 'Coolant temperature',
    color: 'red',
    meaning: 'Coolant temperature is above the normal operating range.',
    action: 'Turn off the AC, turn on the heater to full, pull over and shut down. Let it cool before opening anything.',
    urgency: 'Stop within a mile'
  },
  {
    id: 'oil-level',
    name: 'Oil level',
    color: 'amber',
    meaning: 'The oil level is low or the level sensor has faulted. It is not the same as the oil pressure light.',
    action: 'Check the dipstick once the engine has settled and top up with the specified oil grade.',
    urgency: 'Check today'
  },
  {
    id: 'battery',
    name: 'Charging system',
    color: 'red',
    meaning: 'The alternator is not keeping the battery charged and the car is running on stored power.',
    action: 'Turn off accessories and drive straight to a shop or a safe location.',
    urgency: 'Stop soon'
  },
  {
    id: 'brake-system',
    name: 'Brake system',
    color: 'red',
    meaning: 'Often the parking brake is engaged or brake fluid is low. Can also indicate a hydraulic fault.',
    action: 'Release the parking brake. If the light stays on, check brake fluid and pedal feel before driving.',
    urgency: 'Stop now'
  },
  {
    id: 'check-engine',
    name: 'Check engine',
    color: 'amber',
    meaning: 'The engine computer stored a fault code. Steady is usually emissions or sensor related.',
    action: 'Record the mileage, scan the codes, and repair before a smog or inspection deadline.',
    urgency: 'Scan this week'
  },
  {
    id: 'abs',
    name: 'ABS',
    color: 'amber',
    meaning: 'Anti-lock braking is disabled but normal brakes still work.',
    action: 'Brake normally and get the wheel speed sensors and ABS module scanned.',
    urgency: 'Service this month'
  },
  {
    id: 'tpms',
    name: 'Tire pressure (TPMS)',
    color: 'amber',
    meaning: 'One or more tires is below the recommended pressure, or a sensor battery has died.',
    action: 'Check and set all four pressures cold. Recheck within a day to see if one keeps losing air.',
    urgency: 'Check today'
  },
  {
    id: 'traction',
    name: 'Traction control / stability',
    color: 'amber',
    meaning: 'Stability control is limited or has faulted. A flashing light means it is currently working.',
    action: 'If it is steady, slow down and have the system scanned. A flashing light needs you to reduce throttle.',
    urgency: 'Slow down'
  },
  {
    id: 'power-steering',
    name: 'Power steering',
    color: 'red',
    meaning: 'Assisted steering has failed or the fluid is low, making the wheel much harder to turn.',
    action: 'Reduce speed, use both hands, and check the power steering fluid if your car has a reservoir.',
    urgency: 'Stop soon'
  },
  {
    id: 'airbag',
    name: 'Airbag / SRS',
    color: 'amber',
    meaning: 'An airbag or seat belt pretensioner fault means the system may not deploy in a crash.',
    action: 'Have the SRS system scanned. Note that this often fails a state inspection.',
    urgency: 'Service this month'
  },
  {
    id: 'def-glow',
    name: 'Glow plug (diesel)',
    color: 'amber',
    meaning: 'The diesel pre-heat system has faulted, which can make cold starts rough.',
    action: 'Allow longer pre-heat time and have the glow plugs and controller tested.',
    urgency: 'Service this month'
  },
  {
    id: 'service-vehicle',
    name: 'Service vehicle soon',
    color: 'amber',
    meaning: 'A manufacturer-specific maintenance or non-emissions fault is stored.',
    action: 'Scan for codes and check your maintenance schedule in the app for anything overdue.',
    urgency: 'Scan this week'
  },
  {
    id: 'eco-cruise',
    name: 'Eco or cruise indicators',
    color: 'green',
    meaning: 'These simply confirm a system is active, such as cruise control, eco mode or lane assist.',
    action: 'No action needed. They turn off when the system is disengaged.',
    urgency: 'Normal'
  }
];