"use client";
import { VideoPlayer } from "kora-ui";

export default function Demo() {
  return (
    <VideoPlayer
      className="aspect-video w-full max-w-2xl"
      src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      poster="https://picsum.photos/id/152/1280/720"
      title="Flor y abeja"
      captions={[{ src: "/media/flower-es.vtt", srclang: "es", label: "Español" }]}
    />
  );
}
