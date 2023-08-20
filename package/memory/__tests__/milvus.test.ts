import { milvusVectorDB, LLM } from "@idealeap/gwt";
test("测试milvus的插入", async () => {
  const llm = new LLM({});
  const db = new milvusVectorDB({
    address: "milvus.idealeap.cn:19530",
    COLLECTION_NAME: "t",
    llm: llm,
  });
  const vectorsData = [
    // {
    //   annotation: db.generateVector("hello word"),
    //   type: "index",
    //   style: "tech",
    //   tags: { data: ["tech", "index"] },
    //   annotation_json: {
    //     data: "hello word",
    //   },
    // },
    {
      vector: await db.generateVector("hello word"),
    },
  ];
  const res = await db.upload({
    fields_data: vectorsData,
    partition_name: "test",
    index: {
      field_name: "vector",
      metric_type: "L2",
    },
  });
  console.log(res);
  debugger;
});

test("测试milvus的相似度搜索", async () => {
  const llm = new LLM({});
  const db = new milvusVectorDB({
    address: "milvus.idealeap.cn:19530",
    COLLECTION_NAME: "t",
    llm: llm,
  });
  const res = await db.search({
    vector: await db.generateVector("hello word"),
    output_fields: ["vector", "id"],
  });
  if (res.status.error_code == "Success") {
    console.log(res.results);
  } else {
    console.log(res.status.reason);
  }
  debugger;
  // {
  //   status: { error_code: 'Success', reason: '' },
  //   results: [
  //     { score: 0, id: '443419176591961362', vector: [Array] },
  //     { score: 0, id: '443419176591961366', vector: [Array] },
  //     {
  //       score: 0.0000024025880520639475,
  //       id: '443419176591961364',
  //       vector: [Array]
  //     }
  //   ]
  // }
});
