"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FaVolumeUp,
  FaPlay,
  FaPause,
  FaMicrophone,
  FaExclamationTriangle,
  FaInfoCircle,
  FaStepBackward,
  FaStepForward
} from "react-icons/fa";

interface AudioSample {
  text: string;
  audioUrl: string;
}

interface PronunciationGuideProps {
  audioSamples: AudioSample[];
}

export default function PronunciationGuide({ audioSamples }: PronunciationGuideProps) {
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play the audio for a specific sample
  const playAudio = (index: number) => {
    // First, stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    // If we're already playing this sample, just stop it
    if (currentAudioIndex === index && isPlaying) {
      setIsPlaying(false);
      setCurrentAudioIndex(-1);
      setProgress(0);
      return;
    }

    // Set up a new audio element
    const audio = new Audio();
    audio.src = audioSamples[index].audioUrl;
    audioRef.current = audio;

    // Update state to show the audio is playing
    setCurrentAudioIndex(index);
    setIsPlaying(true);
    setProgress(0);

    // Set up progress tracking
    const duration = audio.duration || 10; // Default to 10 seconds if duration is not available
    progressIntervalRef.current = setInterval(() => {
      const currentProgress = (audio.currentTime / duration) * 100;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setIsPlaying(false);
        setProgress(0);
      }
    }, 50);

    // Play the audio
    audio.play().catch(error => {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
      setCurrentAudioIndex(-1);
      setProgress(0);
    });

    // Handle audio ending
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentAudioIndex(-1);
      setProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  };

  // Toggle play/pause for the current audio
  const togglePlayPause = () => {
    if (!audioRef.current || currentAudioIndex === -1) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);

      // Resume progress tracking
      const duration = audioRef.current.duration;
      progressIntervalRef.current = setInterval(() => {
        const currentProgress = (audioRef.current!.currentTime / duration) * 100;
        setProgress(currentProgress);

        if (currentProgress >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          setIsPlaying(false);
          setProgress(0);
        }
      }, 50);
    }
  };

  // Practice pronunciation (simulated)
  const toggleMicrophone = () => {
    // This would connect to the browser's speech recognition API in a real implementation
    setIsMicrophoneActive(!isMicrophoneActive);

    if (!isMicrophoneActive) {
      // Simulate starting microphone
      setTimeout(() => {
        // Simulate stopping after 3 seconds
        setIsMicrophoneActive(false);
      }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FaVolumeUp className="text-primary" />
          Pronunciation Guide
        </h2>
        <div className="text-sm text-muted-foreground">
          Click on a phrase to hear the pronunciation
        </div>
      </div>

      <div className="space-y-3">
        {audioSamples.map((sample, index) => (
          <Card
            key={index}
            className={`border-0 shadow-sm hover:shadow-md transition-all cursor-pointer ${
              currentAudioIndex === index ? 'bg-primary/5' : ''
            }`}
            onClick={() => playAudio(index)}
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div className="font-medium">{sample.text}</div>
              <Button
                variant="ghost"
                size="sm"
                className={currentAudioIndex === index && isPlaying ? 'text-primary' : ''}
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio(index);
                }}
              >
                {currentAudioIndex === index && isPlaying ? <FaPause /> : <FaPlay />}
              </Button>
            </CardContent>
            {currentAudioIndex === index && (
              <div className="px-4 pb-4">
                <Progress value={progress} className="h-1" />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Audio Player Controls */}
      <div className="pt-4 border-t">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Practice Your Pronunciation</h3>
        </div>

        <div className="bg-primary/5 rounded-lg p-4 mb-4">
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              disabled={currentAudioIndex <= 0}
              onClick={() => {
                if (currentAudioIndex > 0) {
                  playAudio(currentAudioIndex - 1);
                }
              }}
            >
              <FaStepBackward />
            </Button>

            <Button
              variant={isPlaying ? "default" : "outline"}
              disabled={currentAudioIndex === -1}
              onClick={togglePlayPause}
              className="w-12 h-12 rounded-full"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              disabled={currentAudioIndex === -1 || currentAudioIndex >= audioSamples.length - 1}
              onClick={() => {
                if (currentAudioIndex < audioSamples.length - 1) {
                  playAudio(currentAudioIndex + 1);
                }
              }}
            >
              <FaStepForward />
            </Button>
          </div>

          {currentAudioIndex !== -1 && (
            <div className="text-center mt-3 text-sm">
              Now playing: <span className="font-medium">{audioSamples[currentAudioIndex].text}</span>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            variant={isMicrophoneActive ? "default" : "outline"}
            className="gap-2"
            onClick={toggleMicrophone}
          >
            <FaMicrophone className={isMicrophoneActive ? "animate-pulse" : ""} />
            {isMicrophoneActive ? "Recording..." : "Practice Speaking"}
          </Button>
        </div>
      </div>

      <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="text-sky-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-medium mb-1">Pronunciation Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Listen carefully to the audio samples and try to mimic the sounds.</li>
              <li>Pay attention to the nasal sounds that are unique to French.</li>
              <li>French "r" is pronounced in the back of the throat, not like the English "r".</li>
              <li>Practice regularly by recording yourself and comparing with the original.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <FaExclamationTriangle className="inline mr-2" />
        Audio functionality is simulated in this demo. In a real application, this would connect to actual audio files.
      </div>
    </div>
  );
}

