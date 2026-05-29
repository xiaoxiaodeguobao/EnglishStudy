# 实现计划：AI 单词生成功能

## 概述

将 `WordGeneratorService` 从硬编码 mock 实现升级为真实 AI API 调用。核心步骤包括：提取 `OpenAICompatibleAdapter` 基类、新增 DeepSeek 和豆包适配器、新增 `AIProviderFactory`、实现 `WordListResponseParser` 解析模块，最后重构 `WordGeneratorService` 以通过单次 AI 调用生成完整的每日学习内容。

## 任务

- [x] 1. 提取 `OpenAICompatibleAdapter` 基类
  - [x] 1.1 创建 `src/services/ai/OpenAICompatibleAdapter.ts`，将 `OpenAIAdapter` 中的通用 HTTP 调用逻辑（`generateExamples`、`generateSentenceChains`、`validateConnection`）提取到抽象基类中，构造函数接收 `config: AIServiceConfig` 和 `providerName: string`
    - 日志前缀使用 `providerName` 动态生成，替换原有硬编码的 `[OPENAI]`
    - `validateConnection` 改为发送 `max_tokens: 1` 的最小请求（而非调用 `/models` 端点），以兼容 DeepSeek 和豆包
    - _需求：1.1、1.5、2.1、2.5_
  - [x] 1.2 重构 `src/services/ai/OpenAIAdapter.ts`，使其继承 `OpenAICompatibleAdapter`，删除重复逻辑，仅保留构造函数
    - _需求：1.1、2.1_
  - [ ]* 1.3 运行现有 `OpenAIAdapter.test.ts` 确保重构后测试全部通过
    - _需求：1.1_

- [x] 2. 扩展 `AIService` 接口，新增 `generateWordList` 方法
  - [x] 2.1 在 `src/services/ai/types.ts` 中新增 `WordListGenerationRequest`、`WordListGenerationResponse`、`RawWordData`、`RawAssociationData`、`RawSentenceChainData` 接口定义，并在 `AIService` 接口中新增 `generateWordList(request: WordListGenerationRequest): Promise<WordListGenerationResponse>` 方法签名
    - _需求：3.1、3.2、6.1_
  - [x] 2.2 在 `OpenAICompatibleAdapter` 中实现 `generateWordList` 方法：构建包含单词、关联、句子链要求的单次 Prompt，调用 `{apiUrl}/chat/completions`，返回原始响应文本和 metadata
    - Prompt 必须包含：IPA 音标要求、中英文释义要求、至少两个例句要求、JSON 格式要求、`usedWords` 排除列表
    - _需求：3.1、3.2、3.5、4.1、5.1、5.2_
  - [ ]* 2.3 为 `generateWordList` 的 Prompt 构建逻辑编写单元测试，验证 Prompt 包含所有必要内容
    - _需求：3.1、3.2、3.5_

- [x] 3. 实现 `WordListResponseParser` 解析模块
  - [x] 3.1 创建 `src/services/ai/WordListResponseParser.ts`，实现 `extractJSON(content: string): unknown` 函数：先尝试提取 Markdown 代码块（` ```json ... ``` `）内的内容，再用正则提取第一个完整 JSON 对象 `{...}`，均失败则抛出 `GenerationError("AI 返回数据格式无效")`
    - _需求：8.1、8.2、7.3_
  - [x] 3.2 实现 `validateAndFilterWords(raw: unknown[]): RawWordData[]` 函数：校验每个对象的 `word`（非空字符串）、`definitions`（非空数组）、`examples`（非空数组）字段，丢弃不合法的条目并记录 warn 日志
    - _需求：3.3、8.3_
  - [x] 3.3 实现 `normalizeAssociationType(type: string): AssociationType` 函数：将不属于 `theme | semantic | root | context` 的值修正为 `semantic`
    - _需求：4.2_
  - [x] 3.4 实现 `resolveAssociationIds(rawAssociations: RawAssociationData[], words: Word[]): WordAssociation[]` 函数：将文本关联（`word1`/`word2` 为单词文本）转换为基于 `word.id` 的 `WordAssociation` 对象，找不到对应单词的关联直接跳过
    - _需求：4.3_
  - [x] 3.5 实现 `filterValidSentenceChainWords(chains: RawSentenceChainData[], words: Word[]): SentenceChain[]` 函数：过滤每条句子链 `usedWords` 中不在当日单词列表中的单词，生成带 `id` 的 `SentenceChain` 对象
    - _需求：5.3_
  - [ ]* 3.6 为 `WordListResponseParser` 编写属性测试（使用 fast-check）
    - **属性 3：无效单词字段过滤** — 对任意包含部分无效字段的单词数组，`validateAndFilterWords` 结果只包含字段完整的条目
    - **验证：需求 3.3、8.3**
  - [ ]* 3.7 为 `normalizeAssociationType` 编写属性测试
    - **属性 4：非法 associationType 修正为 semantic** — 对任意不属于合法枚举的字符串，结果为 `semantic`
    - **验证：需求 4.2**
  - [ ]* 3.8 为 `resolveAssociationIds` 编写属性测试
    - **属性 5：文本关联到 ID 关联的转换正确性** — 对任意单词列表和文本关联，转换后 `word1Id`/`word2Id` 与原始文本对应单词的 `id` 一致
    - **验证：需求 4.3**
  - [ ]* 3.9 为 `extractJSON` 编写属性测试
    - **属性 11：AI 响应 JSON 提取的健壮性（往返属性）** — 对任意合法 `RawWordListResponse`，序列化后（可选包裹 Markdown 代码块）再通过 `extractJSON` 解析，结果与原始对象语义等价
    - **验证：需求 8.1、8.2、8.4**

- [x] 4. 检查点 — 确保所有测试通过
  - 确保所有测试通过，如有问题请向用户说明。

- [ ] 5. 新增 `DeepSeekAdapter` 和 `DoubaoAdapter`
  - [x] 5.1 创建 `src/services/ai/DeepSeekAdapter.ts`：继承 `OpenAICompatibleAdapter`，构造函数传入 `providerName: 'deepseek'`，无额外逻辑
    - _需求：1.1、1.2、1.3、1.4、1.5_
  - [x] 5.2 创建 `src/services/ai/DoubaoAdapter.ts`：继承 `OpenAICompatibleAdapter`，构造函数传入 `providerName: 'doubao'`，无额外逻辑
    - _需求：2.1、2.2、2.3、2.4、2.5_
  - [ ]* 5.3 为 `DeepSeekAdapter` 编写单元测试（`src/services/ai/DeepSeekAdapter.test.ts`）
    - 验证 `validateConnection` 发送 `max_tokens: 1` 的请求
    - 验证 API 成功时返回正确响应结构
    - 验证 API 返回 4xx/5xx 时抛出 `AIServiceError`（`provider === 'deepseek'`，含 `statusCode`）
    - _需求：1.3、1.4、1.5_
  - [ ]* 5.4 为 `DoubaoAdapter` 编写单元测试（`src/services/ai/DoubaoAdapter.test.ts`）
    - 验证 `validateConnection` 发送 `max_tokens: 1` 的请求
    - 验证 API 成功时返回正确响应结构
    - 验证 API 返回 4xx/5xx 时抛出 `AIServiceError`（`provider === 'doubao'`，含 `statusCode`）
    - _需求：2.3、2.4、2.5_
  - [ ]* 5.5 为 DeepSeek/豆包适配器编写属性测试
    - **属性 1：HTTP 错误状态码映射到 AIServiceError** — 对任意 4xx/5xx 状态码和 `deepseek`/`doubao` 提供商，抛出的 `AIServiceError` 包含正确的 `provider` 和 `statusCode`
    - **验证：需求 1.4、2.4**

- [ ] 6. 新增 `AIProviderFactory`
  - [x] 6.1 创建 `src/services/ai/AIProviderFactory.ts`：实现 `createAIProvider(provider: string, config: EnvConfig): AIService` 工厂函数，根据 `provider` 值分别返回 `OpenAIAdapter`、`ClaudeAdapter`、`DeepSeekAdapter`、`DoubaoAdapter` 实例，使用 `envConfig` 中对应提供商的配置（`apiKey`、`model`、`apiUrl`、`maxRetries`、`timeout`）进行初始化；对不支持的 provider 抛出包含支持列表的错误
    - _需求：6.1、6.2、6.3、6.4、6.5_
  - [ ]* 6.2 为 `AIProviderFactory` 编写单元测试（`src/services/ai/AIProviderFactory.test.ts`）
    - 验证每个合法 provider 返回正确的适配器类型
    - 验证非法 provider 抛出包含 `openai, claude, deepseek, doubao` 的错误信息
    - _需求：6.1、6.2、6.3、6.5_
  - [ ]* 6.3 为工厂函数编写属性测试
    - **属性 9：工厂函数对合法 provider 返回正确适配器类型** — 对任意属于支持列表的 provider，返回对应类型的实例
    - **验证：需求 6.1、6.2、6.3**
  - [ ]* 6.4 为工厂函数编写属性测试
    - **属性 10：工厂函数对非法 provider 抛出包含支持列表的错误** — 对任意不在支持列表中的字符串，抛出的错误信息包含所有支持的提供商名称
    - **验证：需求 6.5**

- [ ] 7. 重构 `WordGeneratorService`
  - [x] 7.1 修改 `src/services/WordGeneratorService.ts`：在构造函数中通过 `createAIProvider(getEnvConfig().aiProvider, getEnvConfig())` 获取 AI 适配器实例，替换原有 mock 逻辑；`generateDailyWords` 调用 `aiService.generateWordList()` 获取原始响应，使用 `WordListResponseParser` 解析和验证数据
    - 调用前后记录包含提供商名称、请求参数摘要和耗时的 INFO 日志
    - API 调用失败时记录包含错误类型、HTTP 状态码（如有）和错误消息的 ERROR 日志
    - _需求：6.4、7.1、7.4、7.5_
  - [x] 7.2 在 `generateDailyWords` 中实现完整的数据处理流程：解析单词列表 → 过滤无效单词 → 记录警告（单词数不足时）→ 解析关联并修正类型 → 转换为 ID 关联 → 检查关联率（< 80% 抛出 `GenerationError`）→ 解析句子链并过滤无效单词 → 检查句子链数量（< 3 抛出 `GenerationError`）
    - _需求：3.3、3.4、4.2、4.3、4.4、5.3、5.4_
  - [x] 7.3 在 `generateDailyWords` 中处理错误降级：`RetryExhaustedError` 转换为包含提供商名称和最后失败原因的 `GenerationError`；JSON 解析失败抛出 `GenerationError("AI 返回数据格式无效")`；不提供 mock 降级
    - _需求：7.2、7.3_
  - [ ]* 7.4 为重构后的 `WordGeneratorService` 编写集成测试（`src/services/WordGeneratorService.ai.test.ts`），mock `AIService`
    - 验证 Prompt 包含 IPA 音标、中英文释义、例句、JSON 格式、`usedWords` 排除列表等必要内容
    - 验证 AI 返回少于请求数量的单词时，返回实际获得的单词（不补充 mock 数据）并记录警告
    - 验证 AI 返回无效 JSON 时抛出 `GenerationError("AI 返回数据格式无效")`
    - 验证所有重试失败时抛出包含提供商名称的 `GenerationError`
    - _需求：3.3、3.4、7.2、7.3_
  - [ ]* 7.5 为 `generateDailyWords` 编写属性测试
    - **属性 2：Prompt 始终包含必要的生成要求** — 对任意合法的 `count`、`planId` 和 `usedWords`，发送的 Prompt 包含所有必要内容
    - **验证：需求 3.1、3.2、3.5**
  - [ ]* 7.6 为关联率检查编写属性测试
    - **属性 6：低关联率触发 GenerationError** — 对任意关联率 < 0.8 的输入，`generateDailyWords` 抛出消息为"生成的单词关联性不足"的 `GenerationError`
    - **验证：需求 4.4**
  - [ ]* 7.7 为句子链过滤编写属性测试
    - **属性 7：句子链无效单词过滤** — 对任意当日单词列表和含无效单词的句子链，过滤后 `usedWordIds` 只包含当日单词列表中存在的 ID
    - **验证：需求 5.3**
  - [ ]* 7.8 为句子链数量检查编写属性测试
    - **属性 8：句子链数量不足触发 GenerationError** — 对任意有效句子链数量 < 3 的 AI 响应，`generateDailyWords` 抛出消息为"生成的句子链数量不足"的 `GenerationError`
    - **验证：需求 5.4**

- [ ] 8. 更新模块导出
  - [x] 8.1 更新 `src/services/ai/index.ts`，导出 `DeepSeekAdapter`、`DoubaoAdapter`、`OpenAICompatibleAdapter`、`AIProviderFactory`（`createAIProvider`）、`WordListResponseParser` 中的公共函数，以及新增的类型定义（`WordListGenerationRequest`、`WordListGenerationResponse` 等）
    - _需求：6.1_

- [x] 9. 最终检查点 — 确保所有测试通过
  - 确保所有测试通过，如有问题请向用户说明。

## 备注

- 标有 `*` 的子任务为可选项，可跳过以加快 MVP 交付
- 每个任务均引用了具体的需求条款，便于追溯
- 检查点任务确保增量验证，避免问题积累
- 属性测试使用项目已安装的 `fast-check@^3.23.1`，每个属性运行 100 次
- 单元测试与属性测试互补，不互相替代
- `WordGeneratorService` 重构后不提供 mock 降级，AI 不可用时向上层抛出 `GenerationError`
