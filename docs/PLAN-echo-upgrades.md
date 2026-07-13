# PLAN: Nâng cấp Cốt lõi Echo English (Magic Scanner & Heatmap)

## 1. Context & Goals
- **Mục tiêu:** Nâng cấp trải nghiệm học tập cốt lõi của Echo English để giữ chân người dùng (Retention) và tạo sự tiện lợi tối đa khi trích xuất từ vựng từ video.
- **Phạm vi (Phase 1):** 
  1. **Magic Scanner**: Tự động trích xuất từ vựng từ Video Transcript.
  2. **Progress Heatmap**: Trực quan hóa chuỗi ngày học tập (Streak) bằng biểu đồ GitHub-style.
  3. **Settings Modal**: Cấu hình cơ bản (Xóa dữ liệu, chỉnh tốc độ giọng).

*(Lưu ý: Đồng bộ Backend/Cloud Sync sẽ được đẩy sang Phase 2 để tập trung làm hoàn hảo trải nghiệm Local trước).*

## 2. Task Breakdown

### Phase 1: Progress Heatmap (Nhật ký học tập)
- [ ] **Data Structure:** Cập nhật `vocabStore` để lưu mảng `studyLogs: { date: string, xpGained: number, wordsReviewed: number }[]`.
- [ ] **Component:** Xây dựng component `HeatmapGraph` (có thể custom bằng CSS Grid 7x52 hoặc thư viện nhẹ).
- [ ] **UI Integration:** Đưa Heatmap ra ngoài `HomePage` (Dưới khu vực StatCards).

### Phase 2: Magic Scanner (Trích xuất từ vựng tự động)
- [ ] **NLP/Lọc từ:** Viết hàm tiện ích lọc bỏ stop-words (I, you, am, is, the, a, an...).
- [ ] **Phân tích:** Lấy toàn bộ `transcript` hiện tại của video, tách từ, đếm tần suất hoặc lọc các từ dài (>5 ký tự).
- [ ] **UI:** Thêm nút "Magic Scan ✨" ở góc khu vực Transcript trong `LessonPage`.
- [ ] **Tương tác:** Hiện Popup/Drawer danh sách các từ vựng tiềm năng, cho phép người dùng click "Lưu tất cả" vào Sổ tay.

### Phase 3: Settings & Data Management
- [ ] **Component:** Tạo `SettingsModal` mở từ Header.
- [ ] **Features:** 
  - Tùy chỉnh tốc độ giọng đọc (Voice Speed: 0.5x, 0.85x, 1x).
  - Nút Danger Zone: Reset XP/Level, Xóa sạch toàn bộ từ vựng (Có modal ConfirmModal xịn).

## 3. Tech Stack & Implementation Details
- **Heatmap:** Dùng CSS thuần (`display: grid; grid-template-columns: repeat(52, 1fr)`) kết hợp tooltip.
- **Scanner Filter:** Dùng 1 mảng stop-words tĩnh (khoảng 100 từ phổ biến nhất) để đối chiếu và loại bỏ.

## 4. Verification Checklist
- [ ] Heatmap hiển thị đúng số XP kiếm được trong ngày hiện tại.
- [ ] Magic Scanner không bị dính các từ vô nghĩa (uh, ah, the, a).
- [ ] Settings Reset Data hoạt động không gây crash app.
