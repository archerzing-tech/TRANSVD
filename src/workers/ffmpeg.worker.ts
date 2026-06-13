/// <reference lib="webworker" />

// This Web Worker handles ffmpeg.wasm processing off the main thread.
// It communicates via structured clone messages.
//
// Messages:
//   { type: "init", payload: { coreURL, wasmURL, workerURL } }
//   { type: "exec", id: string, payload: { args: string[], inputFileName: string, inputData: Uint8Array, outputFileName: string } }
//   { type: "terminate" }
//
// Responses:
//   { type: "progress", payload: { progress: number } }
//   { type: "log", payload: { message: string } }
//   { type: "result", id: string, payload: { output: Uint8Array } }
//   { type: "error", id: string, payload: { message: string } }

let ffmpeg: any = null;

self.onmessage = async (e: MessageEvent) => {
  const { type, payload, id } = e.data;

  switch (type) {
    case "init": {
      try {
        const { FFmpeg } = await import("@ffmpeg/ffmpeg");
        const { toBlobURL } = await import("@ffmpeg/util");

        ffmpeg = new FFmpeg();

        ffmpeg.on("progress", ({ progress }: { progress: number }) => {
          self.postMessage({ type: "progress", payload: { progress: Math.min(progress * 100, 99.9) } });
        });

        ffmpeg.on("log", ({ message }: { message: string }) => {
          self.postMessage({ type: "log", payload: { message } });
        });

        const baseURL = payload?.baseURL || "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";

        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
          workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
        });

        self.postMessage({ type: "init-complete" });
      } catch (err: any) {
        self.postMessage({ type: "error", payload: { message: err.message || "Failed to load FFmpeg" } });
      }
      break;
    }

    case "exec": {
      if (!ffmpeg) {
        self.postMessage({ type: "error", id, payload: { message: "FFmpeg not initialized" } });
        return;
      }
      try {
        const { inputFileName, inputData, args, outputFileName } = payload;

        // Write input file to virtual filesystem
        await ffmpeg.writeFile(inputFileName, inputData);

        // Run ffmpeg command
        await ffmpeg.exec(args);

        // Read output file
        const data = await ffmpeg.readFile(outputFileName);
        const output = data instanceof Uint8Array ? data : new Uint8Array(data);

        // Cleanup
        await ffmpeg.deleteFile(inputFileName);
        try { await ffmpeg.deleteFile(outputFileName); } catch {}

        self.postMessage({ type: "result", id, payload: { output } }, { transfer: [output.buffer] });
      } catch (err: any) {
        self.postMessage({ type: "error", id, payload: { message: err.message || "Execution failed" } });
      }
      break;
    }

    case "terminate": {
      if (ffmpeg) {
        try { ffmpeg.terminate(); } catch {}
        ffmpeg = null;
      }
      self.close();
      break;
    }
  }
};
