"""
SmartBioWaste AI - Model Evaluation & Confusion Matrix
Computes Accuracy, Precision, Recall, F1-Score, and Confusion Matrix.
"""

import os
import argparse
import torch
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import numpy as np

CLASS_NAMES = [
    "infectious",
    "sharps",
    "contaminated_recyclable",
    "glassware",
    "chemical",
    "pharmaceutical",
    "anatomical",
    "general",
    "radiological_hazard"
]

def evaluate_model(model_path: str, test_dir: str, architecture: str = "efficientnet_b0"):
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"Evaluating {model_path} on {test_dir} using {device}...")

    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    if not os.path.exists(test_dir):
        print(f"Test directory '{test_dir}' not found.")
        return

    test_dataset = datasets.ImageFolder(test_dir, transform=transform)
    test_loader = DataLoader(test_dataset, batch_size=16, shuffle=False)

    # Initialize architecture
    if architecture == "mobilenet_v2":
        model = models.mobilenet_v2()
        model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, len(CLASS_NAMES))
    else:
        model = models.efficientnet_b0()
        model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, len(CLASS_NAMES))

    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=device))
        print("Loaded weights successfully.")
    else:
        print(f"Weight file {model_path} not found. Running random initialization evaluation baseline.")

    model = model.to(device)
    model.eval()

    all_preds = []
    all_labels = []

    with torch.no_grad():
        for inputs, labels in test_loader:
            inputs = inputs.to(device)
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())

    # Metrics
    acc = accuracy_score(all_labels, all_preds)
    print("\n================ EVALUATION METRICS ================")
    print(f"Overall Accuracy: {acc * 100:.2f}%\n")
    print("Classification Report (Precision, Recall, F1-Score):")
    target_names = [CLASS_NAMES[i] for i in sorted(list(set(all_labels)))]
    print(classification_report(all_labels, all_preds, target_names=target_names))

    print("Confusion Matrix:")
    cm = confusion_matrix(all_labels, all_preds)
    print(cm)
    print("===================================================\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, default="../models/efficientnet_b0_waste.pth")
    parser.add_argument("--test_dir", type=str, default="../dataset/test")
    parser.add_argument("--arch", type=str, default="efficientnet_b0")
    args = parser.parse_args()

    evaluate_model(args.model, args.test_dir, args.arch)
