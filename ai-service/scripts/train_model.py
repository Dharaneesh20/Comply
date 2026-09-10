"""Fine-tune the SOP semantic matcher on Hugging Face legal-document pairs.

The corpus is public at the time this script was written. Set HF_TOKEN or run
`huggingface-cli login` only if the Hub requires authentication in your setup.
"""
import argparse
import os
from pathlib import Path

from datasets import load_dataset
from sentence_transformers import InputExample, SentenceTransformer, losses
from torch.utils.data import DataLoader

DATASET_ID = "Shekswess/legal-documents"
BASE_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = PROJECT_ROOT / "models" / "legal-matcher"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train the legal semantic matching model")
    parser.add_argument("--epochs", type=int, default=2)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--max-samples", type=int, default=0, help="0 uses all available samples")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    print(f"Downloading {DATASET_ID} from Hugging Face…")
    dataset = load_dataset(DATASET_ID, split="train")
    required_columns = {"keyword", "text"}
    missing = required_columns.difference(dataset.column_names)
    if missing:
        raise ValueError(f"{DATASET_ID} is missing expected columns: {sorted(missing)}")
    if args.max_samples:
        dataset = dataset.select(range(min(args.max_samples, len(dataset))))

    examples = [
        InputExample(texts=[row["keyword"].strip(), row["text"].strip()])
        for row in dataset
        if isinstance(row["keyword"], str) and isinstance(row["text"], str)
        and row["keyword"].strip() and row["text"].strip()
    ]
    if len(examples) < 2:
        raise ValueError("The legal-document dataset did not contain enough usable keyword/text pairs")
    print(f"Training on {len(examples)} real legal keyword/document pairs.")

    model = SentenceTransformer(BASE_MODEL)
    loader = DataLoader(examples, shuffle=True, batch_size=args.batch_size)
    warmup_steps = max(1, int(len(loader) * args.epochs * 0.1))
    model.fit(
        train_objectives=[(loader, losses.MultipleNegativesRankingLoss(model))],
        epochs=args.epochs,
        warmup_steps=warmup_steps,
        show_progress_bar=True,
    )
    args.output.mkdir(parents=True, exist_ok=True)
    model.save(str(args.output))
    print(f"Saved trained legal semantic matcher to {args.output}")


if __name__ == "__main__":
    main()
