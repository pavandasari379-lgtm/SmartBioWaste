import torch
import torch.nn as nn
from torchvision import models

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

class EfficientNetB0WasteClassifier(nn.Module):
    """
    Transfer Learning Model based on EfficientNet-B0.
    Pretrained on ImageNet with customized classification head.
    """
    def __init__(self, num_classes: int = len(CLASS_NAMES), pretrained: bool = True):
        super(EfficientNetB0WasteClassifier, self).__init__()
        weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
        self.backbone = models.efficientnet_b0(weights=weights)
        
        # Replace classifier
        in_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(p=0.3, inplace=True),
            nn.Linear(in_features, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.2, inplace=True),
            nn.Linear(256, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)

    def get_last_conv_layer(self) -> nn.Module:
        """Returns final convolutional layer for Grad-CAM explainability."""
        return self.backbone.features[-1]


class MobileNetV2WasteClassifier(nn.Module):
    """
    Alternative lightweight architecture based on MobileNet-V2.
    Used for mobile edge comparison.
    """
    def __init__(self, num_classes: int = len(CLASS_NAMES), pretrained: bool = True):
        super(MobileNetV2WasteClassifier, self).__init__()
        weights = models.MobileNet_V2_Weights.DEFAULT if pretrained else None
        self.backbone = models.mobilenet_v2(weights=weights)
        
        in_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(p=0.2, inplace=True),
            nn.Linear(in_features, 256),
            nn.ReLU(inplace=True),
            nn.Linear(256, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)

    def get_last_conv_layer(self) -> nn.Module:
        return self.backbone.features[-1]
