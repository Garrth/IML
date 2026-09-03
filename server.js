require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Hardcoded for the skeleton. Once the admin panel exists,
// this list comes from the projects table instead.
const PROJECTS = [
    { slug: 'hydrowheel', name: 'Hydrowheel', status: 'live' },
    { slug: 'perfect-box', name: 'Perfect Box', status: 'coming_soon' }
];

const HYDROWHEEL_COMPONENTS = [
    { slug: 'foil', name: 'Foil', description: 'Flips its angle of attack so it pulls in the same rotational direction whether rising or descending.' },
    { slug: 'air-injection', name: 'Air Injection', description: 'Method for getting air into the foil.' },
    { slug: 'foil-structure', name: 'Foil Structure', description: 'Frame holding the foils, transmits their force.' },
    { slug: 'cylinder', name: 'Cylinder', description: 'Contains the water, houses the structure.' }
];

app.get('/', (req, res) => {
    res.render('index', { projects: PROJECTS });
});

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
    res.render('project', { project, components: HYDROWHEEL_COMPONENTS });
});

app.get('/:projectSlug/:componentSlug', (req, res) => {
    const project = PROJECTS.find(p => p.slug === req.params.projectSlug);
    if (!project || project.status !== 'live') return res.status(404).send('Not found');

    const component = HYDROWHEEL_COMPONENTS.find(c => c.slug === req.params.componentSlug);
    if (!component) return res.status(404).send('Component not found');

    res.render('component', { project, component });
});

app.listen(PORT, () => {
    console.log(`IML running on port ${PORT}`);
});
