require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

// Node 20 (what meridian runs) doesn't have a native WebSocket, and Supabase's
// realtime client needs one just to construct, even though we aren't using
// realtime features yet. Passing the `ws` package in as the transport avoids
// the crash. See: https://github.com/orgs/supabase/discussions/45715
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
        realtime: {
            transport: ws
        }
    }
);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Hardcoded for the skeleton. Once the admin panel exists,
// this list comes from the projects table instead.
const PROJECTS = [
    {
        slug: 'hydrowheel',
        name: 'Hydrowheel',
        status: 'live',
        blurb: 'A buoyancy-and-hydrofoil engine: 30 air-filled vessels orbiting a shaft inside a 24 ft x 60 ft water cylinder. Four components open for design.',
        summary: 'A machine that generates rotational energy from compressed air and water using nothing more exotic than buoyancy and hydrofoils. Thirty sealed vessels ride three loops around a central shaft inside a 24 ft x 60 ft cylinder of fresh water. Analysis puts it at 121% of the energy it consumes, four components are now open for design.',
        analysis: 'v1.1 - COP 1.210'
    },
    {
        slug: 'perfect-box',
        name: 'Perfect Box',
        status: 'coming_soon',
        blurb: "Scope is being written now. Follow the project to get the brief when the first round opens."
    }
];

// NOTE: deadline moved from the original Sept 30 target to Oct 16 (confirmed by Garth).
// Voting deadline (Oct 23) is assumed as one week after submission close, matching the
// Claude Design mockup, not yet explicitly confirmed, flag if that's wrong.
const SPRINT_INFO = {
    deadline: 'October 16',
    votingDeadline: '23 Oct 2026',
    expectations: [
        'Sketches of your idea, however rough',
        'What already exists that solves a similar problem (how is this normally done elsewhere?)',
        'Your take on customizing that for this specific application',
        'Off-the-shelf parts that could work for a first prototype, and where to get them'
    ]
};

const HYDROWHEEL_COMPONENTS = [
    {
        slug: 'foil',
        code: 'HW-C01',
        name: 'Foil',
        summary: 'Flips its angle of attack so it pulls in the same rotational direction whether rising or descending.',
        image: '/images/foil-duotone.png',
        figureCaption: 'FOIL RISING (L) AND FALLING (R)',
        problem: "A solid, symmetric foil pivots around a shaft through its own center, like a hard sail with the mast through the middle of the chord. It's mounted to a wire that loops around two wheels on the ends of an arm. Air gets injected into the foil at the bottom of its travel, then continues to push water out as the air expands as it rises. The wing has to flip 180 degrees so it pulls the arm in the same direction whether it's rising or falling.",
        questions: [
            'How does the foil attach to the wire?',
            'How does air get injected at the bottom? How does it fill with water at the top?',
            'How much air can realistically get pumped in during the short time the foil is actually at the bottom?'
        ]
    },
    {
        slug: 'air-delivery',
        code: 'HW-C02',
        name: 'Air Delivery',
        summary: 'Method for getting air into the foil.',
        image: '/images/cutaway-duotone.png',
        figureCaption: 'AIR DELIVERY REFERENCE',
        problem: "Compressed air needs to get from a compressor down to each vessel and injected without any escaping into the water. For now, this means the most efficient standard compressor setup available, not wave-powered air, that's a future goal. One idea worth exploring: build the air tank into the center shaft itself, and use the arms to route air out to each vessel. The hard part is making a connection to a vessel that's only in position for a moment, and keeping it sealed long enough to actually move a useful amount of air before it disconnects again.",
        questions: [
            'How does a moving vessel dock into a fixed air supply automatically, every cycle, without anyone operating it manually?',
            'How is that connection sized so enough air transfers in the available time?'
        ]
    },
    {
        slug: 'foil-structure',
        code: 'HW-C03',
        name: 'Foil Structure',
        summary: 'Frame holding the foils, transmits their force.',
        image: '/images/structure-duotone.png',
        figureCaption: 'FULL ASSEMBLY',
        problem: 'The center shaft, the arms holding each vessel, the wheels, and the wire loop connecting it all together need to survive the real forces involved, rotational torque, wire tension, wave loading, while adding as little friction as possible. Friction is the main efficiency loss this entire machine is trying to avoid, so this challenge is as much about minimizing drag as it is about strength.',
        questions: [
            'What materials and bearing types keep friction low at every moving joint (wheel axles, foil pivots) while holding up to continuous saltwater exposure?',
            'How do the arms carry force from each vessel back to the central shaft without excessive flex?',
            "How is the wire and wheel loop tensioned and guided so it doesn't slip or bind?"
        ]
    },
    {
        slug: 'cylinder',
        code: 'HW-C04',
        name: 'Cylinder and Platform',
        summary: 'Contains the water, houses the structure.',
        image: '/images/cutaway-duotone.png',
        figureCaption: 'CYLINDER CUTAWAY',
        problem: "The outer cylinder holds the water and houses the entire rotating structure. It needs to be strong enough to support everything inside it, and like everything else here, as frictionless as possible. It also needs a working platform, and a way to lift the whole rotating assembly, foils and all, out of the water for maintenance or to swap in an updated design.",
        questions: [
            'What is the cylinder built from, and how, so it handles continuous structural load without adding drag or friction to the moving parts inside it?',
            'What lifting method (winch, crane, hoist) pulls the whole rotating assembly up and out cleanly?'
        ]
    }
];

app.get('/', (req, res) => {
    const stats = {
        projects: PROJECTS.length,
        openComponents: HYDROWHEEL_COMPONENTS.length,
        roundCloses: SPRINT_INFO.deadline
    };
    res.render('index', { projects: PROJECTS, stats });
});

app.get('/why-iml', (req, res) => res.render('why-iml'));

app.get('/pages/merch', (req, res) => res.render('placeholder', { title: 'Merch' }));
app.get('/pages/media', (req, res) => res.render('placeholder', { title: 'Content & Media' }));
app.get('/pages/sponsors', (req, res) => res.render('placeholder', { title: 'Sponsors' }));
app.get('/pages/login', (req, res) => res.render('placeholder', { title: 'Log In' }));
app.get('/pages/signup', (req, res) => res.render('placeholder', { title: 'Sign Up' }));
app.get('/admin', (req, res) => res.render('placeholder', { title: 'Admin (locked down later)' }));

app.get('/:projectSlug', (req, res) => {
    const project = PROJECTS.find(p => p.slug === req.params.projectSlug);
    if (!project) return res.status(404).send('Project not found');

    if (project.status === 'coming_soon') {
        return res.render('coming-soon', { project });
    }

    // Only Hydrowheel is live in the skeleton right now
    res.render('project', { project, components: HYDROWHEEL_COMPONENTS, sprintInfo: SPRINT_INFO });
});

app.get('/:projectSlug/:componentSlug', (req, res) => {
    const project = PROJECTS.find(p => p.slug === req.params.projectSlug);
    if (!project || project.status !== 'live') return res.status(404).send('Not found');

    const component = HYDROWHEEL_COMPONENTS.find(c => c.slug === req.params.componentSlug);
    if (!component) return res.status(404).send('Component not found');

    res.render('component', { project, component, sprintInfo: SPRINT_INFO });
});

app.listen(PORT, () => {
    console.log(`IML running on port ${PORT}`);
});
