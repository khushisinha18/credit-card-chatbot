import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def recommend_cards(user_profile):
    with open(os.path.join(BASE_DIR, "cards.json"), "r") as f:
        cards = json.load(f)

    matching_cards = []

    for card in cards:
        match_score = 0

        # Check income if available
        if "income" in user_profile and "₹" in card.get("eligibility", ""):
            income_req = ''.join(filter(str.isdigit, card["eligibility"]))
            if income_req and int(user_profile["income"]) >= int(income_req):
                match_score += 1

        # Match perks
        for perk in user_profile.get("benefits", []):
            if perk.lower() in [p.lower() for p in card.get("perks", [])]:
                match_score += 2

        # Spending habits
        for habit in user_profile.get("habits", []):
            if habit.lower() in card.get("reward_type", "").lower():
                match_score += 1

        if match_score > 0:
            matching_cards.append((card, match_score))

    # Sort by score, descending
    top_cards = sorted(matching_cards, key=lambda x: x[1], reverse=True)[:5]

    # Format results
    result = []
    for card, score in top_cards:
        result.append({
            "name": card["name"],
            "issuer": card["issuer"],
            "reason": f"Matched on benefits, spending, and eligibility. Score: {score}",
            "perks": card.get("perks", []),
            "image_url": card.get("image_url", "https://via.placeholder.com/150"),
            "link": card.get("affiliate_link", "#")
        })

    return result

def compare_cards_by_name(names: list[str]):
    with open(os.path.join(BASE_DIR, "cards.json"), "r") as f:
        cards = json.load(f)

    found = [card for card in cards if card["name"] in names]

    # You can also enrich this with normalized perks, reward rates, etc.
    return [
        {
            "name": card["name"],
            "issuer": card["issuer"],
            "joining_fee": card.get("joining_fee", 0),
            "annual_fee": card.get("annual_fee", 0),
            "reward_type": card.get("reward_type", ""),
            "reward_rate": card.get("reward_rate", ""),
            "perks": card.get("perks", []),
            "image_url": card.get("image_url", ""),
            "link": card.get("affiliate_link", "#")
        }
        for card in found
    ]