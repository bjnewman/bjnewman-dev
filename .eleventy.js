export default function(eleventyConfig) {
  // Copy styles from src to public
  eleventyConfig.addPassthroughCopy({ "src/styles": "styles" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // The React app build at public/app is excluded via .eleventyignore
  // so it won't be deleted when Eleventy builds

  return {
    dir: {
      input: "content",
      includes: "_includes",
      output: "public"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
