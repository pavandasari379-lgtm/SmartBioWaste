"""
SmartBioWaste AI - EfficientNet-B0 Model Training Pipeline
Transfer learning script for 9 biomedical waste classes.
"""

import os
import argparse
import time
import copy
import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim import lr_scheduler
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader

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

def build_data_transforms():
    return {
        'train': transforms.Compose([
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(15),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

def train_model(data_dir: str, num_epochs: int = 15, batch_size: int = 16, lr: float = 0.001, output_path: str = "models/efficientnet_b0_waste.pth"):
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device} for EfficientNet-B0 training.")

    data_transforms = build_data_transforms()
    
    if not os.path.exists(os.path.join(data_dir, 'train')):
        print(f"Dataset directory '{data_dir}/train' not found. Please provide dataset images in class subfolders.")
        return

    image_datasets = {
        x: datasets.ImageFolder(os.path.join(data_dir, x), data_transforms[x])
        for x in ['train', 'val'] if os.path.exists(os.path.join(data_dir, x))
    }
    
    dataloaders = {
        x: DataLoader(image_datasets[x], batch_size=batch_size, shuffle=True, num_workers=2)
        for x in image_datasets
    }
    dataset_sizes = {x: len(image_datasets[x]) for x in image_datasets}

    # Load EfficientNet-B0 with ImageNet pretrained weights
    print("Loading pretrained EfficientNet-B0 backbone...")
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)

    # Freeze base feature extraction layers initially
    for param in model.features.parameters():
        param.requires_grad = False

    # Customize classification head
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3, inplace=True),
        nn.Linear(in_features, 256),
        nn.BatchNorm1d(256),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.2, inplace=True),
        nn.Linear(256, len(CLASS_NAMES))
    )

    model = model.to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.classifier.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.5)

    best_model_wts = copy.deepcopy(model.state_dict())
    best_acc = 0.0

    print(f"Starting training for {num_epochs} epochs...")
    since = time.time()

    for epoch in range(num_epochs):
        print(f"Epoch {epoch+1}/{num_epochs}")
        print("-" * 10)

        for phase in ['train', 'val']:
            if phase not in dataloaders:
                continue

            if phase == 'train':
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
                inputs = inputs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            if phase == 'train':
                scheduler.step()

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]

            print(f"{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}")

            if phase == 'val' and epoch_acc > best_acc:
                best_acc = epoch_acc
                best_model_wts = copy.deepcopy(model.state_dict())

    time_elapsed = time.time() - since
    print(f"Training completed in {time_elapsed // 60:.0f}m {time_elapsed % 60:.0f}s")
    print(f"Best Validation Accuracy: {best_acc:.4f}")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    model.load_state_dict(best_model_wts)
    torch.save(model.state_dict(), output_path)
    print(f"Model saved successfully to {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train EfficientNet-B0 for Biomedical Waste")
    parser.add_argument("--data_dir", type=str, default="../dataset", help="Path to dataset containing train/ and val/ dirs")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=16, help="Training batch size")
    parser.add_argument("--lr", type=float, default=0.001, help="Initial learning rate")
    parser.add_argument("--output", type=str, default="../models/efficientnet_b0_waste.pth", help="Target model path")
    args = parser.parse_args()

    train_model(args.data_dir, num_epochs=args.epochs, batch_size=args.batch_size, lr=args.lr, output_path=args.output)
