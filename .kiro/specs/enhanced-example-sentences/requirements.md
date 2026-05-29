# 需求文档：增强例句和连锁句功能

## 简介

本功能旨在改进词汇学习应用中的例句生成系统，使其能够根据单词的实际应用场景生成更丰富、更自然、更多样化的例句和连锁句。当前系统使用固定模板生成例句，导致内容单一、缺乏针对性。增强后的系统将提供场景化、地道化的例句，帮助学习者更好地理解单词在不同语境中的使用方式。

## 术语表

- **Example_Sentence_Service**: 例句生成服务，负责为单词生成例句
- **Sentence_Chain_Service**: 连锁句生成服务，负责生成使用多个单词的句子
- **Context_Analyzer**: 语境分析器，分析单词的应用场景类型
- **Template_Engine**: 模板引擎，当前使用固定模板生成例句的组件
- **AI_Service**: AI服务接口，用于调用外部AI API生成高质量例句
- **Example_Sentence**: 例句对象，包含英文句子、中文翻译和高亮单词
- **Sentence_Chain**: 连锁句对象，包含使用多个单词的句子及其翻译
- **Application_Context**: 应用场景，指单词的使用语境（如商务、日常、学术等）
- **Diversity_Score**: 多样性评分，衡量例句集合的多样化程度
- **Naturalness_Score**: 自然度评分，衡量例句的地道程度

## 需求

### 需求 1：场景化例句生成

**用户故事：** 作为学习者，我希望看到单词在不同应用场景中的例句，以便理解单词在实际交流中的使用方式。

#### 验收标准

1. WHEN 生成例句请求包含单词信息时，THE Context_Analyzer SHALL 识别该单词的主要应用场景类型（日常对话、商务交流、学术写作、技术文档、文学表达中的至少一种）
2. THE Example_Sentence_Service SHALL 为每个识别出的应用场景生成至少2个例句
3. WHEN 单词适用于多个场景时，THE Example_Sentence_Service SHALL 在生成的例句集合中包含至少3种不同场景的例句
4. THE Example_Sentence_Service SHALL 在每个例句的元数据中标注其所属的应用场景类型
5. WHEN 显示例句时，THE 用户界面 SHALL 按应用场景分组显示例句

### 需求 2：消除模板化内容

**用户故事：** 作为学习者，我希望看到自然、地道的例句，而不是机械的模板填充，以便学习真实的语言使用方式。

#### 验收标准

1. THE Example_Sentence_Service SHALL NOT 使用固定的句子模板生成例句
2. WHEN 生成例句时，THE Example_Sentence_Service SHALL 确保同一单词的例句在句式结构上具有多样性
3. THE Example_Sentence_Service SHALL 计算生成的例句集合的 Diversity_Score
4. THE Diversity_Score SHALL 基于句子长度变化、句式结构类型、词汇丰富度三个维度计算
5. WHEN Diversity_Score 低于0.6时，THE Example_Sentence_Service SHALL 重新生成例句直到达到阈值
6. THE Example_Sentence_Service SHALL 避免在不同例句中重复使用相同的句子开头（前3个单词）

### 需求 3：提高例句自然度和地道性

**用户故事：** 作为学习者，我希望例句听起来像母语者会说的话，以便学习地道的表达方式。

#### 验收标准

1. THE Example_Sentence_Service SHALL 使用 AI_Service 生成例句而非简单的模板替换
2. WHEN 调用 AI_Service 时，THE Example_Sentence_Service SHALL 在提示词中明确要求生成自然、地道的例句
3. THE Example_Sentence_Service SHALL 验证生成的例句不包含明显的语法错误
4. THE Example_Sentence_Service SHALL 验证生成的例句使用了符合目标场景的词汇和表达方式
5. WHEN 例句包含俚语或习语时，THE Example_Sentence_Service SHALL 在翻译中提供额外的文化注释

### 需求 4：增加例句数量和质量控制

**用户故事：** 作为学习者，我希望看到足够多的高质量例句，以便从多个角度理解单词的用法。

#### 验收标准

1. THE Example_Sentence_Service SHALL 为每个单词生成12到15个例句
2. WHEN 生成例句时，THE Example_Sentence_Service SHALL 确保至少80%的例句长度在8到20个单词之间
3. THE Example_Sentence_Service SHALL 验证每个例句都包含目标单词（不区分大小写）
4. THE Example_Sentence_Service SHALL 验证每个例句都有对应的中文翻译
5. WHEN 例句质量验证失败时，THE Example_Sentence_Service SHALL 记录失败原因并重新生成该例句
6. THE Example_Sentence_Service SHALL 在生成完成后返回实际生成的例句数量和质量统计信息

### 需求 5：增强连锁句的多样性和场景性

**用户故事：** 作为学习者，我希望连锁句能展示多个单词在真实场景中的组合使用，以便理解单词之间的关联和实际应用。

#### 验收标准

1. THE Sentence_Chain_Service SHALL 为每组每日单词生成5到8个连锁句
2. WHEN 生成连锁句时，THE Sentence_Chain_Service SHALL 确保每个连锁句使用至少2个且不超过4个每日单词
3. THE Sentence_Chain_Service SHALL 为连锁句分配应用场景类型（与例句场景类型一致）
4. THE Sentence_Chain_Service SHALL 确保生成的连锁句集合覆盖至少3种不同的应用场景
5. WHEN 显示连锁句时，THE 用户界面 SHALL 标注每个连锁句使用的单词和所属场景
6. THE Sentence_Chain_Service SHALL 确保连锁句在语义上连贯且符合所标注的应用场景

### 需求 6：AI服务集成

**用户故事：** 作为系统，我需要集成AI服务来生成高质量的例句和连锁句，以便提供自然、地道的语言内容。

#### 验收标准

1. THE Example_Sentence_Service SHALL 定义 AI_Service 接口，包含生成例句和连锁句的方法
2. THE AI_Service 接口 SHALL 支持传入单词、场景类型、数量等参数
3. THE Example_Sentence_Service SHALL 实现针对 OpenAI API 的 AI_Service 适配器
4. THE Example_Sentence_Service SHALL 实现针对 Claude API 的 AI_Service 适配器
5. WHEN AI_Service 调用失败时，THE Example_Sentence_Service SHALL 返回包含错误信息的 NetworkError
6. THE Example_Sentence_Service SHALL 实现重试机制，在 AI_Service 调用失败时最多重试2次
7. THE Example_Sentence_Service SHALL 记录所有 AI_Service 调用的日志，包括请求参数和响应时间

### 需求 7：例句缓存和性能优化

**用户故事：** 作为用户，我希望系统快速响应，避免重复生成相同单词的例句，以便获得流畅的学习体验。

#### 验收标准

1. THE Example_Sentence_Service SHALL 在本地存储中缓存已生成的例句
2. WHEN 请求某个单词的例句时，THE Example_Sentence_Service SHALL 首先检查缓存中是否存在该单词的例句
3. WHEN 缓存中存在且例句生成时间在30天内时，THE Example_Sentence_Service SHALL 直接返回缓存的例句
4. WHEN 缓存中不存在或例句已过期时，THE Example_Sentence_Service SHALL 调用 AI_Service 生成新例句并更新缓存
5. THE Example_Sentence_Service SHALL 在缓存中存储例句的生成时间戳
6. THE Example_Sentence_Service SHALL 提供清除缓存的方法

### 需求 8：用户界面增强

**用户故事：** 作为学习者，我希望例句和连锁句的展示更加清晰和有组织，以便更好地浏览和学习。

#### 验收标准

1. WHEN 显示例句时，THE ExampleSentences 组件 SHALL 按应用场景分组显示例句
2. THE ExampleSentences 组件 SHALL 为每个场景分组添加场景标签（如"日常对话"、"商务交流"）
3. THE ExampleSentences 组件 SHALL 在每个例句卡片上显示句子长度和复杂度指示器
4. WHEN 显示连锁句时，THE SentenceChainSection 组件 SHALL 显示每个连锁句的应用场景标签
5. THE SentenceChainSection 组件 SHALL 使用不同颜色高亮连锁句中的不同单词
6. THE 用户界面 SHALL 提供筛选功能，允许用户按场景类型筛选例句和连锁句

### 需求 9：例句质量评估

**用户故事：** 作为系统，我需要评估生成的例句质量，以便确保提供给用户的内容符合标准。

#### 验收标准

1. THE Example_Sentence_Service SHALL 实现 Naturalness_Score 计算方法
2. THE Naturalness_Score SHALL 基于句子语法正确性、词汇适当性、表达地道性三个维度计算
3. WHEN 例句的 Naturalness_Score 低于0.7时，THE Example_Sentence_Service SHALL 标记该例句为低质量
4. THE Example_Sentence_Service SHALL 在返回例句集合时过滤掉所有低质量例句
5. WHEN 过滤后例句数量少于最小要求时，THE Example_Sentence_Service SHALL 重新生成例句
6. THE Example_Sentence_Service SHALL 记录质量评估的统计信息，包括平均分数和低质量例句比例

### 需求 10：配置和可扩展性

**用户故事：** 作为开发者，我希望系统具有良好的配置性和可扩展性，以便根据需要调整和扩展功能。

#### 验收标准

1. THE Example_Sentence_Service SHALL 从配置文件读取例句生成参数（数量范围、质量阈值、场景类型列表）
2. THE Example_Sentence_Service SHALL 支持通过配置文件切换不同的 AI_Service 实现
3. THE Example_Sentence_Service SHALL 提供插件接口，允许添加自定义的场景分析器
4. THE Example_Sentence_Service SHALL 提供插件接口，允许添加自定义的质量评估器
5. WHEN 配置文件不存在或格式错误时，THE Example_Sentence_Service SHALL 使用默认配置并记录警告日志
6. THE Example_Sentence_Service SHALL 在启动时验证配置的有效性并报告任何配置错误
