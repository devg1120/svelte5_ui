import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess({
      postcss: true
    })
  ],
	kit: {
		adapter: adapter(),
                alias: {
                   'test_components': 'src/lib'
                }
	}
};

export default config;
