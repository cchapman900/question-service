# Question Service API
A service for basic CRUD operations for questions

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

## Usage

In `handler.js` update the `mongoString` with your mongoDB url.

### /questions
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

### /questions/{question_id}
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
