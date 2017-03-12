
A simple command line utility that converts a set of WAV format HRTFs to a single js file for use in the [binauralFIR]() module.

Currently only understands sets of wav files from the [IRCAM HRTF database](http://recherche.ircam.fr/equipes/salles/listen/download.html).

# Dependencies

```
npm install
```

# Usage

Download an HRTF dataset and unzip:

```
mkdir samples
cd samples/
wget ftp://ftp.ircam.fr/pub/IRCAM/equipes/salles/listen/archive/SUBJECTS/IRC_1002.zip
unzip IRC_1002.zip
cd ../
```

Convert to js:

```
./cmd.js samples/COMPENSATED/WAV/IRC_1002_C > hrtf.js
```

# License and Copyright

License: AGPLv3

Copyright 2017 Marc Juul

