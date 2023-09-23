import { milvusVectorDB, LLM } from "llm-ops";
import "dotenv/config";
test("测试milvus的插入", async () => {
  const llm = new LLM({});
  const db = new milvusVectorDB({
    COLLECTION_NAME: "minippt",
    llm: llm,
  });
  const vectorsData = [
    {
      annotation: await db.generateVector("hello word"),
      type: "太好哩",
      style: "tech",
      tags: { data: ["你好", "index"] },
      annotation_json: {
        data: "hello word",
      },
    },
    // {
    //   vector: await db.generateVector("hello word"),
    // },
  ];
  const res = await db.upload({
    fields_data: vectorsData,
    partition_name: "test",
    index: {
      field_name: "annotation",
      metric_type: "L2",
    },
  });
  console.log(res);
  debugger;
});

test("测试milvus的相似度搜索", async () => {
  const db = new milvusVectorDB({
    COLLECTION_NAME: "minippt",
  });
  const res = await db.search({
    vector: await db.generateVector("hello word"),
    output_fields: "annotation",
    limit: 10,
  });
  if (res.status.error_code == "Success") {
    console.log(res.results);
  } else {
    console.log(res.status.reason);
  }
  debugger;
});

test("测试milvus的promptTemplate生成", async () => {
  const db = new milvusVectorDB({
    COLLECTION_NAME: "minippt",
  });
  const res = await db.generatePromptTemplate({
    vector: await db.generateVector("hello word"),
    output_fields: "type",
    limit: 3,
    content: "有没有可能：\n{{vector}}。\n上面这些才是精品！",
  });
  console.log(res.content);
  debugger;
});
