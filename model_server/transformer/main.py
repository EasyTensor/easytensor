import inspect
import importlib.util
from typing import Optional
from fastapi import FastAPI, Request
from starlette.responses import JSONResponse
import torch

MODEL_PARAMETERS_FILE = "/models/model/model_weights"
MODEL_ARCHITECTURE_FILE = "/models/model/model.py"
spec = importlib.util.spec_from_file_location("model", MODEL_ARCHITECTURE_FILE)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

classes = [
    clas[1]
    for clas in inspect.getmembers(
        module,
        lambda member: inspect.isclass(member) and member.__module__ == module.__name__,
    )
]

if len(classes) > 1:
    raise BaseException(
        "Expected only one class definition in the model file. "
        + "Found multiple: {}. ".format(classes)
        + "Please include only your model's class definition."
    )

if len(classes) < 1:
    raise BaseException(
        (
            "Expected at least one class definition in the model file. "
            "Please include the class definition of your model."
        )
    )

ModelClass = classes[0]

app = FastAPI()

model = ModelClass.from_pretrained(MODEL_PARAMETERS_FILE)
model.eval()


@app.get("/health")
def health_status():
    return {"status": "healthy"}


@app.post("/predict")
async def predict(request: Request):
    the_json = await request.json()
    result = model.predict_single(the_json["instances"][0])
    return JSONResponse({"predictions": result})
