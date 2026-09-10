import os
from datasets import load_dataset
from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader

def main():
    print("Loading dataset Shekswess/legal-documents...")
    ds = load_dataset("Shekswess/legal-documents", split="train")
    
    # Take a subset for faster training demonstration (e.g. 500 samples)
    # The dataset has 1000 rows, taking 500
    subset = ds.select(range(500))
    
    train_examples = []
    for row in subset:
        if row['keyword'] and row['text']:
            # For MultipleNegativesRankingLoss, we provide pairs of (anchor, positive)
            train_examples.append(InputExample(texts=[row['keyword'], row['text']]))
    
    print(f"Created {len(train_examples)} training examples.")
    
    # Initialize the model
    model_name = 'all-MiniLM-L6-v2'
    print(f"Loading base model: {model_name}")
    model = SentenceTransformer(model_name)
    
    # DataLoader
    train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=16)
    
    # Loss function
    train_loss = losses.MultipleNegativesRankingLoss(model=model)
    
    # Train
    print("Starting training...")
    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        epochs=1,
        warmup_steps=100,
        show_progress_bar=True
    )
    
    # Save the model
    save_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'legal-matcher')
    print(f"Saving fine-tuned model to {save_path}")
    model.save(save_path)
    print("Training complete!")

if __name__ == "__main__":
    main()
