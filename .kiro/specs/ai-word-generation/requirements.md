# 需求文档

## 简介

本功能将英语词汇学习应用的 `WordGeneratorService` 从硬编码 mock 实现升级为真实 AI 接口调用，支持 DeepSeek 和豆包（Doubao）两个 AI 提供商。AI 将根据学习计划的主题和难度，生成包含音标、释义、例句的单词列表，以及单词间的语义关联和句子链，帮助学习者在真实语境中记忆词汇。

## 词汇表

- **WordGeneratorService**：负责生成每日单词列表的服务，当前为 mock 实现，目标是接入真实 AI API
- **DeepSeek_Adapter**：基于 OpenAI 兼容格式调用 DeepSeek API 的适配器
- **Doubao_Adapter**：基于 OpenAI 兼容格式调用豆包（Doubao）API 的适配器
- **AI_Provider**：当前激活的 AI 服务提供商，由 `VITE_AI_PROVIDER` 环境变量决定
- **Word**：包含单词文本、音标、释义列表和例句列表的数据结构
- **WordAssociation**：描述两个单词之间关联关系（主题、语义、词根、语境）的数据结构
- **SentenceChain**：使用多个单词构成的连贯英文句子及其中文翻译
- **DailyWordList**：某一天的完整学习内容，包含单词列表、关联关系和句子链
- **Prompt**：发送给 AI 模型的结构化指令文本
- **JSON_Response**：AI 返回的、符合预定义 schema 的 JSON 格式数据

---

## 需求

### 需求 1：DeepSeek 适配器

**用户故事：** 作为开发者，我希望通过 DeepSeek API 生成单词内容，以便在中国大陆环境下以低成本获得高质量的英语词汇数据。

#### 验收标准

1. THE **DeepSeek_Adapter** SHALL 实现与 `OpenAIAdapter` 相同的 `AIService` 接口（`generateExamples`、`generateSentenceChains`、`validateConnection`）
2. WHEN `VITE_AI_PROVIDER` 为 `deepseek` 时，THE **DeepSeek_Adapter** SHALL 使用 `VITE_DEEPSEEK_API_KEY`、`VITE_DEEPSEEK_MODEL` 和 `VITE_DEEPSEEK_API_URL` 进行初始化
3. WHEN 发起 API 请求时，THE **DeepSeek_Adapter** SHALL 向 `{VITE_DEEPSEEK_API_URL}/chat/completions` 发送 OpenAI 兼容格式的 POST 请求，并在 `Authorization` 头中携带 `Bearer {apiKey}`
4. IF DeepSeek API 返回 HTTP 4xx 或 5xx 错误，THEN THE **DeepSeek_Adapter** SHALL 抛出包含提供商名称 `deepseek`、HTTP 状态码和原始错误信息的 `AIServiceError`
5. WHEN 验证连接时，THE **DeepSeek_Adapter** SHALL 发送一个 `max_tokens` 为 1 的最小请求，并在请求成功时返回 `true`，失败时返回 `false`

---

### 需求 2：豆包（Doubao）适配器

**用户故事：** 作为开发者，我希望通过豆包 API 生成单词内容，以便为中国大陆用户提供另一个可选的 AI 提供商。

#### 验收标准

1. THE **Doubao_Adapter** SHALL 实现与 `OpenAIAdapter` 相同的 `AIService` 接口（`generateExamples`、`generateSentenceChains`、`validateConnection`）
2. WHEN `VITE_AI_PROVIDER` 为 `doubao` 时，THE **Doubao_Adapter** SHALL 使用 `VITE_DOUBAO_API_KEY`、`VITE_DOUBAO_MODEL` 和 `VITE_DOUBAO_API_URL` 进行初始化
3. WHEN 发起 API 请求时，THE **Doubao_Adapter** SHALL 向 `{VITE_DOUBAO_API_URL}/chat/completions` 发送 OpenAI 兼容格式的 POST 请求，并在 `Authorization` 头中携带 `Bearer {apiKey}`
4. IF 豆包 API 返回 HTTP 4xx 或 5xx 错误，THEN THE **Doubao_Adapter** SHALL 抛出包含提供商名称 `doubao`、HTTP 状态码和原始错误信息的 `AIServiceError`
5. WHEN 验证连接时，THE **Doubao_Adapter** SHALL 发送一个 `max_tokens` 为 1 的最小请求，并在请求成功时返回 `true`，失败时返回 `false`

---

### 需求 3：单词列表生成 Prompt

**用户故事：** 作为学习者，我希望 AI 生成的单词具有真实的音标、中英文释义和例句，以便我能高效地学习词汇。

#### 验收标准

1. WHEN `WordGeneratorService.generateDailyWords` 被调用时，THE **WordGeneratorService** SHALL 向 AI_Provider 发送包含以下要求的 Prompt：生成指定数量的英语单词，每个单词包含音标（IPA 格式）、至少一条词性+中文释义+英文释义，以及至少两个例句（含中文翻译）
2. THE **WordGeneratorService** SHALL 在 Prompt 中要求 AI 以 JSON 数组格式返回数据，每个元素符合 `Word` 类型结构（`id` 字段由客户端生成，AI 不需要提供）
3. WHEN AI 返回的 JSON 中某个单词缺少 `word`、`definitions` 或 `examples` 字段时，THE **WordGeneratorService** SHALL 丢弃该单词并记录警告日志
4. WHEN AI 返回的有效单词数量少于请求数量时，THE **WordGeneratorService** SHALL 记录警告日志并返回实际获得的单词（不补充 mock 数据）
5. THE **WordGeneratorService** SHALL 在 Prompt 中传入已学过的单词列表（`usedWords`），要求 AI 不重复生成这些单词

---

### 需求 4：单词关联生成

**用户故事：** 作为学习者，我希望每日单词之间有明确的语义关联，以便通过联想记忆法提高记忆效率。

#### 验收标准

1. WHEN 生成单词列表时，THE **WordGeneratorService** SHALL 在同一个 Prompt 中要求 AI 同时生成单词间的关联关系，每条关联包含 `word1`（单词文本）、`word2`（单词文本）、`associationType`（`theme`/`semantic`/`root`/`context` 之一）和 `description`（关联描述）
2. WHEN AI 返回的关联数据中 `associationType` 不属于合法枚举值时，THE **WordGeneratorService** SHALL 将该关联的类型修正为 `semantic`
3. WHEN 生成完成后，THE **WordGeneratorService** SHALL 将 AI 返回的单词文本关联转换为基于 `word.id` 的 `WordAssociation` 对象
4. WHEN 关联率（已关联单词对数 / 总单词对数）低于 80% 时，THE **WordGeneratorService** SHALL 抛出 `GenerationError`，错误信息为"生成的单词关联性不足"

---

### 需求 5：句子链生成

**用户故事：** 作为学习者，我希望获得将多个单词串联在一起的例句，以便在真实语境中理解单词的搭配用法。

#### 验收标准

1. WHEN 生成单词列表时，THE **WordGeneratorService** SHALL 在同一个 Prompt 中要求 AI 生成至少 3 条句子链，每条句子链使用当日单词列表中的 2 至 4 个单词
2. THE **WordGeneratorService** SHALL 要求 AI 为每条句子链提供英文句子（`sentence`）和中文翻译（`translation`），以及所使用的单词列表（`usedWords`，单词文本数组）
3. WHEN AI 返回的句子链中 `usedWords` 包含不在当日单词列表中的单词时，THE **WordGeneratorService** SHALL 过滤掉这些无效单词 ID，保留有效的 `usedWordIds`
4. WHEN AI 返回的有效句子链数量少于 3 条时，THE **WordGeneratorService** SHALL 抛出 `GenerationError`，错误信息为"生成的句子链数量不足"

---

### 需求 6：AI 提供商工厂与路由

**用户故事：** 作为开发者，我希望系统根据环境变量自动选择正确的 AI 适配器，以便在不修改代码的情况下切换 AI 提供商。

#### 验收标准

1. THE **AI_Provider** 工厂函数 SHALL 根据 `VITE_AI_PROVIDER` 的值（`openai`/`claude`/`deepseek`/`doubao`）返回对应的适配器实例
2. WHEN `VITE_AI_PROVIDER` 为 `deepseek` 时，THE **AI_Provider** 工厂函数 SHALL 返回使用 DeepSeek 配置初始化的 **DeepSeek_Adapter** 实例
3. WHEN `VITE_AI_PROVIDER` 为 `doubao` 时，THE **AI_Provider** 工厂函数 SHALL 返回使用豆包配置初始化的 **Doubao_Adapter** 实例
4. THE **WordGeneratorService** SHALL 通过工厂函数获取 AI 适配器，而不是直接实例化具体适配器类
5. IF `VITE_AI_PROVIDER` 为不支持的值，THEN THE **AI_Provider** 工厂函数 SHALL 抛出包含支持的提供商列表的错误信息

---

### 需求 7：错误处理与降级

**用户故事：** 作为用户，我希望当 AI 服务不可用时能看到明确的错误提示，而不是应用崩溃或静默失败。

#### 验收标准

1. IF AI API 调用因网络错误或超时失败，THEN THE **WordGeneratorService** SHALL 按照现有 `RetryHandler` 的配置（最多 3 次，指数退避）进行重试
2. IF 所有重试均失败，THEN THE **WordGeneratorService** SHALL 抛出 `GenerationError`，错误信息包含 AI 提供商名称和最后一次失败的原因
3. IF AI 返回的 JSON 无法解析（格式错误），THEN THE **WordGeneratorService** SHALL 抛出 `GenerationError`，错误信息为"AI 返回数据格式无效"
4. THE **WordGeneratorService** SHALL 在每次 API 调用前后记录包含提供商名称、请求参数摘要和耗时的 INFO 级别日志
5. IF API 调用失败，THE **WordGeneratorService** SHALL 记录包含错误类型、HTTP 状态码（如有）和错误消息的 ERROR 级别日志

---

### 需求 8：JSON 响应解析的健壮性

**用户故事：** 作为开发者，我希望解析器能容忍 AI 返回的轻微格式偏差，以便减少因 AI 输出不稳定导致的生成失败。

#### 验收标准

1. WHEN AI 返回的内容包含 Markdown 代码块（如 ` ```json ... ``` `）时，THE **WordGeneratorService** SHALL 提取代码块内的 JSON 内容进行解析
2. WHEN AI 返回的内容在 JSON 数组前后包含额外文本时，THE **WordGeneratorService** SHALL 使用正则表达式提取第一个完整的 JSON 数组进行解析
3. THE **WordGeneratorService** SHALL 对解析后的每个单词对象进行字段类型校验：`word` 为非空字符串，`definitions` 为非空数组，`examples` 为非空数组
4. FOR ALL 合法的单词 JSON 对象，解析后再序列化为 JSON 再解析，SHALL 得到语义等价的对象（往返解析属性）
