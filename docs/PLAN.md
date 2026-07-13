# PLAN.md - Feature: Spaced Repetition System (SRS)

## 1. Quyết định chiến lược (Strategic Decision)
Giữa **SRS (Lặp lại ngắt quãng)** và **Magic Scanner (Quét từ vựng)**, hệ thống quyết định chọn **SRS**. 
**Lý do:** SRS là "trái tim" của mọi ứng dụng học ngôn ngữ (như Anki, Duolingo). Việc nạp từ vựng nhanh (Magic Scanner) sẽ vô nghĩa nếu người dùng học trước quên sau. SRS sẽ giải quyết triệt để vấn đề ghi nhớ, biến Echo English từ một cuốn sổ tay thông thường thành một cỗ máy luyện trí nhớ thực thụ. Magic Scanner sẽ được làm ở Phase sau.

## 2. Mục tiêu (Objective)
Tích hợp thuật toán lặp lại ngắt quãng (dựa trên SuperMemo/Anki) vào Zustand Store và thay đổi logic của màn hình Practice (Luyện tập).

## 3. Các bước triển khai (Tasks Breakdown)

### Phase 2A: Nâng cấp Data Layer (vocabStore.js)
- Thêm trường `box` (cấp độ ghi nhớ, mặc định: 0) và `nextReviewDate` (ngày cần ôn lại, mặc định: hôm nay) cho mỗi từ vựng mới thêm vào.
- Viết hàm `reviewVocab(id, isCorrect)`:
  - Nếu `isCorrect` (Đúng): Tăng `box` lên 1. Tính toán `nextReviewDate` mới dựa trên `box` (ví dụ: Box 1 = mai ôn, Box 2 = 3 ngày sau, Box 3 = 7 ngày sau, Box 4 = 14 ngày sau, Box 5 = 30 ngày sau).
  - Nếu `isCorrect` (Sai): Reset `box = 0`, ép `nextReviewDate` về ngay hôm nay để ôn lại liên tục.

### Phase 2B: Cập nhật UI & Logic Luyện tập (VocabPage.jsx)
- Đổi logic lấy danh sách luyện tập: Thay vì lấy ngẫu nhiên toàn bộ sổ tay, chỉ lọc ra các từ có `nextReviewDate <= hôm nay`.
- Nếu danh sách cần ôn trống: Hiển thị màn hình chức mừng *"Tuyệt vời! Bạn đã hoàn thành tất cả bài ôn tập hôm nay."* để người dùng cảm thấy thỏa mãn (Zero Inbox effect).
- Gắn hàm `reviewVocab(id, isCorrect)` vào các Mini Games (Quiz, Spelling, Fill Blank).
- Thêm nhãn (Badge) ở ngoài thẻ từ vựng hiển thị trạng thái (VD: 🔴 Cần ôn, 🟢 Đã nhớ).

## 4. Agents phân công (Agents Assignment)
- `project-planner`: Phân tích và lập kế hoạch (Done).
- `backend-specialist`: Xử lý thuật toán ngày tháng và logic Zustand Store.
- `frontend-specialist`: Cập nhật giao diện Practice Mode và các thẻ từ vựng.
- `test-engineer`: Kiểm tra luồng tính toán ngày tháng xem có bị lỗi múi giờ không.
