# Local ML artifacts

The model files in this directory are local artifacts; the TrafficNexus server does not load them or expose inference endpoints yet. The ML Detection page currently provides browser-local media preview only.

## What is here

- `real/` contains PyTorch and joblib classifiers/detectors with partial training metadata.
- `synthetic/` contains nine joblib models and metrics explicitly marked as synthetic prototype data.
- `crowd/`, `itd/`, `PotHole/`, `speed/`, and `easyocr/` contain additional PyTorch weights.
- `torch_hub/` contains YOLOv5 source code, not a configured inference service.
- The contractor Keras model is accompanied by a label encoder and preprocessor; both are serialized pickle files.

## Validation notes

- `real/accident_classifier_resnet18.pt` passed a restricted state-dict load, strict ResNet-18 architecture check, and CPU smoke inference with a dummy image tensor.
- The contractor `.keras` archive and its weights are intact. The saved model config does not load with the installed Keras 3.5.0 because it contains a `quantization_config` field; its metadata says it was saved with Keras 3.13.2. The layer stack and weights did pass a CPU smoke inference when reconstructed from the saved config.
- Other custom YOLO checkpoints and joblib/pickle artifacts have not been loaded or inference-tested. The real-model metrics are partial, and their `generated_at` timestamp predates one listed model's `trained_at`.
- Metrics are supplied training metadata, not independent validation. Synthetic models are prototype-only and should not be treated as production-ready.

To connect any model to the application, implement a server-side adapter and endpoint with its expected preprocessing, input shape, output labels, and runtime requirements. Do not put model weights in `client/public`; the browser should send media to the server-side service.
