import nextConfig from "@/next.config";

it("allows the live camper cover-image host", () => {
  expect(nextConfig.images?.remotePatterns).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        protocol: "https",
        hostname: "ac.goit.global",
      }),
    ]),
  );
});
