const http = require('http');

const getArtifactsResponse = {
  artifacts: [
    {
      id: "1234",
      type: "image",
      creationTimestamp: "2020-06-12T14:14:43.637443957Z",
      image: {
        tags:["build.1234"]
      },
      labels: {
        project: "proj1"
      }
    }
  ]
};

const getServicesResponse = {
  services: [
    {
      deployment: {
        cluster: {
          id: "prod-whatever"
        }
      }
    }
  ]
};

const putDeploymentRequestResponse = {
  event: {
    id: "1234"
  }
}

const server = http.createServer(function (req, res) {
  if (req.url.startsWith('/artifacts')) {
    res.writeHead(200);
    res.end(JSON.stringify(getArtifactsResponse));
  } else if (req.url.startsWith('/services')) {
    res.writeHead(200);
    res.end(JSON.stringify(getServicesResponse));
  } else {
    res.writeHead(201)
    res.end(JSON.stringify(putDeploymentRequestResponse));
  }
});
server.listen(3000);
