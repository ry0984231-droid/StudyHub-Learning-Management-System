import React, { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

export const VideoPlayer = ({ videoUrl, videoType = "youtube", title, onEnded }) => {
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [muted, setMuted] = useState(false);
    const [showSpeed, setShowSpeed] = useState(false);
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    const getYouTubeUrl = url => {
        let id = "";
        if (url?.includes("youtu.be/")) id = url.split("youtu.be/")[1]?.split("?")[0];
        else if (url?.includes("watch?v=")) id = url.split("watch?v=")[1]?.split("&")[0];
        else if (url?.includes("embed/")) id = url.split("embed/")[1]?.split("?")[0];

        return id
            ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`
            : url;
    };

    const isYouTube =
        videoType === "youtube" ||
        videoUrl?.includes("youtube.com") ||
        videoUrl?.includes("youtu.be");

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        video.paused ? (video.play(), setPlaying(true)) : (video.pause(), setPlaying(false));
    };

    const changeSpeed = value => {
        setSpeed(value);
        if (videoRef.current) videoRef.current.playbackRate = value;
        setShowSpeed(false);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setMuted(video.muted);
    };

    const fullscreen = () =>
        !document.fullscreenElement
            ? containerRef.current?.requestFullscreen?.()
            : document.exitFullscreen?.();

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-xl group"
        >
            {isYouTube ? (
                <iframe
                    src={getYouTubeUrl(videoUrl)}
                    title={title || "Lecture video"}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            ) : (
                <>
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full object-contain"
                        onEnded={() => {
                            setPlaying(false);
                            onEnded?.();
                        }}
                        onClick={togglePlay}
                    />

                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={togglePlay}
                                    className="p-2 rounded-full bg-white/20 hover:bg-white/30"
                                >
                                    {playing ? <Pause size={20} /> : <Play size={20} />}
                                </button>

                                <button
                                    onClick={toggleMute}
                                    className="p-2 rounded-full hover:bg-white/20"
                                >
                                    {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </button>

                                <span className="text-xs text-gray-300">
                                    {title || "Academic Lecture"}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <button
                                        onClick={() => setShowSpeed(v => !v)}
                                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white/10 hover:bg-white/20"
                                    >
                                        {speed}x
                                    </button>

                                    {showSpeed && (
                                        <div className="absolute bottom-8 right-0 min-w-[65px] p-1 bg-gray-900 rounded-lg shadow-lg">
                                            {[0.75, 1, 1.25, 1.5, 2].map(value => (
                                                <button
                                                    key={value}
                                                    onClick={() => changeSpeed(value)}
                                                    className={`w-full px-2 py-1.5 text-xs text-left rounded ${speed === value
                                                            ? "bg-blue-600 text-white"
                                                            : "text-gray-300 hover:bg-gray-800"
                                                        }`}
                                                >
                                                    {value}x
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={fullscreen}
                                    className="p-2 rounded-full hover:bg-white/20"
                                >
                                    <Maximize size={17} />
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default VideoPlayer;