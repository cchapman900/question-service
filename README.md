# Question Service API
A service for basic CRUD operations for questions

### API URL:
https://zzch3oyp2b.execute-api.us-east-1.amazonaws.com/dev

## Requirements
- Auth0
- Serverless

### Auth0 Setup
See [this guide](https://auth0.com/docs/integrations/aws-api-gateway/custom-authorizers)

### Serverless
See [this guide](https://auth0.com/docs/integrations/aws-api-gateway/custom-authorizers)

## Application Setup

```
npm install
serverless deploy
```

Rename `example.config.yml` to `config.yml` and add your MongoDB Atlas connection string to the `MONGO_URI` property

## Endpoints

### GET [/questions](https://zzch3oyp2b.execute-api.us-east-1.amazonaws.com/dev/questions)
**List Projects**

*query parameters*
- limit: Integer
- offset: Integer

*response:*
```json
[
    {
        "_id": "5adc372941a60b6d03e72d1f",
        "question": "What is 6324 * 4040?",
        "answer": "25548960",
        "distractors": [
            "3952",
            "3906",
            "2694"
        ]
    },
    {
        "_id": "5adc372941a60b6d03e72d20",
        "question": "What is 7269 * 2771?",
        "answer": "20142399",
        "distractors": [
            "874"
        ]
    }
]
```

### POST /questions
**Create Project**

*path parameters*
- question_id: ObjectID

*request body*
```json
{
    "question": "What is 6324 * 4040?",
    "answer": "25548960",
    "distractors": [
        "3952",
        "3906",
        "2694"
    ]
}
```

### GET [/questions/{question_id}](https://zzch3oyp2b.execute-api.us-east-1.amazonaws.com/dev/questions/5adc372941a60b6d03e72d1c)
**Get Project**

*path parameters*
- question_id: ObjectID

*response*
```json
{
    "_id": "5adc372941a60b6d03e72d1f",
    "question": "What is 6324 * 4040?",
    "answer": "25548960",
    "distractors": [
        "3952",
        "3906",
        "2694"
    ]
}
```

*response*
```json
{
    "__v": 0,
    "question": "What is 1754 - 3936?",
    "answer": "-2182",
    "_id": "5add5c68cc90baab0f818ed5",
    "distractors": [
        "3952",
        "3906",
        "2694"
    ]
}
```

### PUT /questions/{question_id}
**Update Project**

*path parameters*
- question_id: ObjectID

*request body*
```json
{
    "question": "What is 6324 * 4040?",
    "answer": "25548960",
    "distractors": [
        "3952",
        "3906",
        "2694"
    ]
}
```

*response*
```json
{
    "__v": 0,
    "question": "What is 1754 - 3936?",
    "answer": "-2182",
    "_id": "5add5c68cc90baab0f818ed5",
    "distractors": [
        "3952",
        "3906",
        "2694"
    ]
}
```

### DELETE /questions/{question_id}
**Delete Project**

*path parameters*
- question_id: ObjectID

*response*
```
No content
```