import requests

BASE_URL = "http://localhost:8000"

def test():
    # 1. Create a form -> appears in GET /forms
    res = requests.post(f"{BASE_URL}/forms", json={"title": "Test Form"})
    form = res.json()
    form_id = form["id"]
    print(f"Created form: {form_id}")
    
    # Check GET /forms
    res = requests.get(f"{BASE_URL}/forms")
    forms = res.json()
    assert any(f["id"] == form_id for f in forms), "Form not in list"
    
    # 2. Add 2-3 questions -> GET /forms/{id} returns them in order
    requests.post(f"{BASE_URL}/forms/{form_id}/questions", json={"title": "Q1", "type": "short_text"})
    requests.post(f"{BASE_URL}/forms/{form_id}/questions", json={"title": "Q2", "type": "email", "required": True})
    q3_res = requests.post(f"{BASE_URL}/forms/{form_id}/questions", json={"title": "Q3", "type": "multiple_choice", "options": ["A", "B", "C"]})
    q3 = q3_res.json()
    
    res = requests.get(f"{BASE_URL}/forms/{form_id}")
    questions = res.json()["questions"]
    q_ids = [q["id"] for q in questions]
    print(f"Questions added: {q_ids}")
    
    # 3. Reorder -> order_index reflects new order
    new_order = [q_ids[2], q_ids[0], q_ids[1]]
    requests.put(f"{BASE_URL}/forms/{form_id}/questions/reorder", json={"question_ids": new_order})
    
    res = requests.get(f"{BASE_URL}/forms/{form_id}")
    reordered_ids = [q["id"] for q in res.json()["questions"]]
    assert reordered_ids == new_order, f"Reorder failed: {reordered_ids} != {new_order}"
    print("Reorder passed")
    
    # 4. Publish -> slug generated
    res = requests.post(f"{BASE_URL}/forms/{form_id}/publish")
    slug = res.json()["slug"]
    print(f"Published form, slug: {slug}")
    
    # 5. Public form fetch
    res = requests.get(f"{BASE_URL}/public/forms/{slug}")
    assert res.status_code == 200, "Public form fetch failed"
    
    # 6. Unpublish
    requests.post(f"{BASE_URL}/forms/{form_id}/unpublish")
    res = requests.get(f"{BASE_URL}/public/forms/{slug}")
    assert res.status_code == 404, "Unpublish failed, form still accessible"
    requests.post(f"{BASE_URL}/forms/{form_id}/publish") # republish
    
    # 7. Submit valid & invalid responses
    # invalid email
    res = requests.post(f"{BASE_URL}/public/forms/{slug}/responses", json={
        "answers": [
            {"question_id": q_ids[1], "value": "bademail"}
        ]
    })
    assert res.status_code == 422, f"Expected 422 for bad email, got {res.status_code}"
    
    # valid response
    res = requests.post(f"{BASE_URL}/public/forms/{slug}/responses", json={
        "answers": [
            {"question_id": q_ids[0], "value": "Ans1"},
            {"question_id": q_ids[1], "value": "test@example.com"},
            {"question_id": q_ids[2], "value": "A"}
        ]
    })
    assert res.status_code == 200, f"Submit failed: {res.json()}"
    print("Response submitted")
    
    # 8. Check GET /forms/{id}/responses and stats
    res = requests.get(f"{BASE_URL}/forms/{form_id}/responses")
    assert len(res.json()) >= 1, "Response not in list"
    
    res = requests.get(f"{BASE_URL}/forms/{form_id}/stats")
    stats = res.json()
    assert str(q_ids[2]) in stats, "Stats missing question"
    assert stats[str(q_ids[2])]["distribution"]["A"] == 1, "Stats count failed"
    print("Stats verified")
    
    # 9. Duplicate form
    res = requests.post(f"{BASE_URL}/forms/{form_id}/duplicate")
    dup_form = res.json()
    assert dup_form["id"] != form_id, "Duplicate has same ID"
    assert len(dup_form["questions"]) == 3, "Duplicate missing questions"
    print(f"Duplicated form: {dup_form['id']}")
    
    # 10. Delete form
    requests.delete(f"{BASE_URL}/forms/{dup_form['id']}")
    res = requests.get(f"{BASE_URL}/forms/{dup_form['id']}")
    assert res.status_code == 404, "Delete failed"
    print("Delete verified")
    
    print("ALL TESTS PASSED")

if __name__ == "__main__":
    test()
