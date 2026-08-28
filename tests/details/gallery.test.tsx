import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, type ReactNode } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import type { CamperImage } from "@/types/camper";

const { mainSwiper, swiperProps } = vi.hoisted(() => ({
  mainSwiper: { slideTo: vi.fn() },
  swiperProps: [] as Array<Record<string, unknown>>,
}));

vi.mock("swiper/react", () => ({
  Swiper: ({
    children,
    onSwiper,
    ...props
  }: {
    children: ReactNode;
    onSwiper?: (swiper: SwiperInstance) => void;
  }) => {
    swiperProps.push(props);
    useEffect(() => {
      onSwiper?.(mainSwiper as unknown as SwiperInstance);
    }, [onSwiper]);
    return <div>{children}</div>;
  },
  SwiperSlide: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("swiper/modules", () => ({ Keyboard: {}, Thumbs: {} }));
vi.mock("swiper/css", () => ({}));
vi.mock("swiper/css/thumbs", () => ({}));

import { CamperGallery } from "@/features/camper-details/CamperGallery";

const images: CamperImage[] = [3, 1, 2].map((order) => ({
  id: `image-${order}`,
  camperId: "camper-1",
  original: `https://images.example/original-${order}.jpg`,
  thumb: `https://images.example/thumb-${order}.jpg`,
  order,
}));

beforeEach(() => {
  mainSwiper.slideTo.mockClear();
  swiperProps.length = 0;
});

it("renders original images in API order with descriptive alt text", () => {
  render(<CamperGallery camperName="Road Bear" images={images} />);

  const slides = screen.getAllByRole("img", { name: /Road Bear — image/ });
  expect(slides).toHaveLength(3);
  [3, 1, 2].forEach((order, index) => {
    expect(slides[index].getAttribute("src")).toContain(
      encodeURIComponent(`https://images.example/original-${order}.jpg`),
    );
  });
});

it("loads visible gallery images eagerly without preloading thumbnails", () => {
  render(<CamperGallery camperName="Road Bear" images={images} />);

  const mainImages = screen.getAllByRole("img", { name: /Road Bear — image/ });
  expect(mainImages).toHaveLength(3);
  mainImages.forEach((image) =>
    expect(image).toHaveAttribute("loading", "eager"),
  );

  const thumbnailImages = screen.getAllByRole("presentation", { hidden: true });
  expect(thumbnailImages).toHaveLength(3);
  thumbnailImages.forEach((image) =>
    expect(image).toHaveAttribute("loading", "eager"),
  );
  thumbnailImages.forEach((image) =>
    expect(image).not.toHaveAttribute("fetchpriority", "high"),
  );
});

it("enables keyboard navigation and lets a thumbnail select its matching slide", async () => {
  const user = userEvent.setup();
  render(<CamperGallery camperName="Road Bear" images={images} />);

  expect(swiperProps[0]).toMatchObject({
    keyboard: { enabled: true },
    tabIndex: 0,
  });
  await user.click(
    screen.getByRole("button", { name: "Show Road Bear image 2" }),
  );
  expect(mainSwiper.slideTo).toHaveBeenCalledWith(1);
});
