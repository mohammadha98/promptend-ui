/** @type {import('tailwindcss').Config} */
const { join } = require('path');
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
