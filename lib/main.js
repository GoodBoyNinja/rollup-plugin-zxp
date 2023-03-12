import zxpSignCmd from 'zxp-sign-cmd';
import { join, relative, isAbsolute, extname } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync, lstatSync, statSync } from 'fs';
import colors from 'colors/safe.js';
import readJson from 'read-package-json-fast';
import deepmerge from 'deepmerge';


export default (pluginOptions = {}) => {
    const defaults = {
        overrideCert: true,
        overrideZXP: true,
        selfSignedCert: {
            country: '',
            state: '',
            city: '',
            province: '',
            org: '',
            name: '',
            email: '',
            output: `.secret/cert.p12`,
            password: '',
        },
        sign: {
            input: '',
            output: '',
            cert: '',
            password: ''
        },
        gitIgnore: [],
    };


    // merge
    const userOptions = { ...pluginOptions }; // clone before merge with defaults
    pluginOptions = deepmerge(defaults, pluginOptions);

    let shouldMakeCert = userOptions.selfSignedCert !== undefined;
    let shouldSign = userOptions.sign !== undefined;


    return {
        name: 'rollup-plugin-zxp',
        async writeBundle(outputOptions, bundle) {
            handleGitIgnore(pluginOptions.gitIgnore);
            let distDir = relative(process.cwd(), outputOptions.dir);
            if (shouldMakeCert) { await selfSignedCertWrapper(pluginOptions); }
            if (shouldSign) { await signWrapper(pluginOptions, distDir); }
        }
    };
};


// wrappers of zxpSignCmd functions to handle the plugin options
async function selfSignedCertWrapper(pluginOptions) {
    let shouldOverrideCert = pluginOptions.overrideCert;
    let certOps = pluginOptions.selfSignedCert;

    // if the output folder doesn't exist, create it
    let abs = isAbsolute(certOps.output) ? certOps.output : join(process.cwd(), certOps.output);

    let dir = join(abs, '..');
    if (!existsSync(dir)) { mkdirSync(dir, { recursive: true }); }


    // if it doesn't exist / override is approved, create it
    let exists = existsSync(abs);
    switch (true) {
        case !exists:
        case shouldOverrideCert:
            if (exists) { deleteFile(abs); }
            await zxpSignCmd.selfSignedCert(certOps);
            break;

        default:
            console.log("\nCertificate already exists. Will use it for signing instead of generating a new one.");
    }
}

async function signWrapper(pluginOptions, distDir) {

    // shortcut
    let signOps = pluginOptions.sign;
    let certOps = pluginOptions.selfSignedCert;

    let pckg = await readJson('./package.json') || {};
    let projectName = pckg.name || 'my-extension';
    let generatedDirName = `ZXP-${genDate()}`;
    let generatedFileName = `${projectName}.zxp`;


    if (extname(signOps.output) === '') {
        signOps.output = join(signOps.output, generatedFileName);
    }

    signOps.input = signOps.input || distDir;
    signOps.cert = signOps.cert || certOps.output;
    signOps.output = signOps.output || join(process.cwd(), generatedDirName, generatedFileName);


    let certAbs = isAbsolute(signOps.cert) ? signOps.cert : join(process.cwd(), signOps.cert);
    if (!existsSync(certAbs)) {
        throw new Error("\nCannot sign the zxp because the certificate file does not exist. Please check your options. Looked for certificate at: " + certAbs + "\n");
    }

    // make the dir if it doesn't exist
    let absZXPPath = isAbsolute(signOps.output) ? signOps.output : join(process.cwd(), signOps.output);
    let dir = join(absZXPPath, '..');
    if (!existsSync(dir)) { mkdirSync(dir, { recursive: true }); }

    // if the zxp file already exists, delete it if overrideZXP is true
    let exists = existsSync(absZXPPath);
    switch (true) {
        case !exists:
        case pluginOptions.overrideZXP:
            if (exists) { deleteFile(absZXPPath); }
            await zxpSignCmd.sign(signOps);
            break;

        default:
            console.log("\nZXP file already exists and I'm not allowed to override it. Please check your options.");
    }


}


function genDate() {
    const d = new Date();
    return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}-${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}`;
}

function deleteFile(pathToItem) {
    let stats = statSync(pathToItem);
    if (stats.isDirectory()) { return; }
    unlinkSync(pathToItem);
}

function handleGitIgnore(keys = []) {

    if (!keys || !keys.length) { return; }

    // 1. if a git ignore file doesn't exist, create it
    if (!existsSync('.gitignore')) { writeFileSync('.gitignore', ''); }

    // 2. make sure each key is in the file. Only write the file if changes are made
    let gitIgnore = readFileSync('.gitignore', 'utf8');
    let lines = gitIgnore.split('\n');
    let changed = false;

    for (let key of keys) {
        if (!lines.includes(key)) {
            lines.push(key);
            changed = true;
        }
    }

    if (changed) {
        writeFileSync('.gitignore', lines.join('\n'));
    }

}