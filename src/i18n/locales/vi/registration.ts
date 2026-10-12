import type { LocaleNamespace } from '../../types';

const registration: LocaleNamespace<'registration'> = {
  formTitle: 'Đăng ký thành viên mới KawanCosplay',
  formDesc:
    'Chào mừng bạn đến với KawanCosplay Community (KCC), cộng đồng cosplay quốc tế 100% SFW. KCC là một phần của KawanCosplay Group, gồm KawanCosplay Media và KawanCosplay Community. KCC là nhóm WhatsApp và máy chủ Discord do KawanCosplay lập ra. Ban đầu được tạo làm nơi giao lưu cho các cosplayer hợp tác với KawanCosplay trên Instagram, nay cộng đồng mở cửa cho bất kỳ ai quan tâm đến thế giới cosplay, dù bạn có phải là cosplayer hay không. Thành lập ngày 30 tháng 6 năm 2025. Hãy thoải mái trở thành một phần của chúng tôi và giao lưu với các thành viên trong nhóm WhatsApp và/hoặc máy chủ Discord. Chúng tôi chào đón thành viên quốc tế, không phân biệt tôn giáo, chủng tộc và ngôn ngữ. Để đảm bảo an toàn và ngăn chặn lạm dụng, vui lòng điền đơn để tham gia cộng đồng. Liên kết nhóm WhatsApp sẽ hiển thị sau khi bạn gửi đơn. Vì vậy, vui lòng không đóng tab này sau khi điền xong đơn. Tuy nhiên, máy chủ Discord chỉ có thể tham gia sau khi bạn đã vào nhóm WhatsApp. Nếu cần thêm hỗ trợ, vui lòng nhắn tin (DM) cho @kawancosplayers trên Instagram hoặc liên hệ hotline +62 857-1103-2782 qua WhatsApp.',
  inclusiveWelcome: 'Chào đón tất cả mọi người: cosplayer, fan idol, otaku và những người bạn yêu pop culture!',
  requiredIndicator: '* Biểu thị câu hỏi bắt buộc',
  officialFormTag: 'Đơn chính thức của KawanCosplay',
  safeCommunityTag: 'Cộng đồng lành mạnh & 100% SFW',
  nameLabel: 'Tên (Tên cosplay / Biệt danh / Nghệ danh)',
  namePrivacyNotice:
    'Để bảo vệ quyền riêng tư, bạn KHÔNG cần cung cấp tên thật. Tên giả, biệt danh cosplay hoặc nghệ danh là hoàn toàn đủ.',
  namePlaceholder: 'Câu trả lời của bạn (ví dụ: Ken, AlyaChan, Rian)',
  stageOrFakeName: 'Tên cosplay / Nghệ danh / Tên giả / Biệt danh / Bí danh',
  realNameOptional: 'Họ tên thật theo giấy tờ (Tùy chọn - để trống nếu bạn muốn giữ riêng tư)',
  fullNameLabel: 'Họ tên theo giấy tờ (Tùy chọn)',
  phoneLabel: 'Số WhatsApp / Di động (Tùy chọn)',
  whatsappLabel: 'Số di động WhatsApp đang hoạt động (Bắt buộc)',
  whatsappNotice:
    'Bắt buộc vì KawanCosplay là cộng đồng hoạt động trên WhatsApp. Mỗi thành viên chỉ có một tài khoản KCC ID duy nhất. Liên kết nhóm WhatsApp chính thức sẽ được mở ngay sau khi gửi đơn.',
  whatsappPlaceholder: 'Câu trả lời của bạn (ví dụ: +62 812 3456 7890 hoặc 0812...)',
  discordLabel: 'Tên người dùng Discord',
  discordDesc:
    'Nhập tên người dùng Discord của bạn để đồng bộ vai trò (role) trên máy chủ Discord của KawanCosplay (ví dụ: alyachan hoặc user#0001).',
  discordPlaceholder: 'Câu trả lời của bạn (ví dụ: alyachan hoặc user#0001)',
  emailLabel: 'Địa chỉ Email đang hoạt động',
  emailOptionalNotice:
    'Không bắt buộc. Bạn có thể để trống vì cơ sở dữ liệu cộng đồng của chúng tôi chưa bao giờ yêu cầu email.',
  emailRequiredNotice: 'Email là bắt buộc để đăng ký.',
  emailPlaceholder: 'Câu trả lời của bạn (ví dụ: ten@example.com)',
  ageCategoryLabel: 'Tình trạng độ tuổi (Chưa thành niên / Đã thành niên - Người lớn)',
  legalAge: 'Đã thành niên / Người lớn (từ 18 tuổi trở lên)',
  minorAge: 'Chưa thành niên (dưới 18 tuổi)',
  preferNotToSay: 'Không muốn tiết lộ',
  ageExplanationTitle: '"Chưa thành niên" và "Đã thành niên" nghĩa là gì?',
  ageExplanationDesc:
    '"Chưa thành niên" là người dưới 18 tuổi (chưa trưởng thành về mặt pháp lý), giúp cộng đồng đảm bảo an toàn phù hợp với lứa tuổi. "Đã thành niên" là người từ 18 tuổi trở lên.',
  exactAgeOptional: 'Tuổi chính xác hoặc ngày sinh (Tùy chọn - có thể để trống)',
  ageDesc: 'Không bắt buộc. Để trống hoặc chia sẻ để nhận lời chúc sinh nhật từ cộng đồng.',
  agePlaceholder: 'Câu trả lời của bạn (ví dụ: 21 tuổi hoặc 15 tháng 5)',
  locationTitle: 'Nơi cư trú (Tất cả quốc gia & thành phố trên thế giới)',
  locationNotice: 'KawanCosplay mở cửa cho thành viên từ mọi nơi trên thế giới.',
  countryLabel: 'Quốc gia sinh sống',
  provinceLabel: 'Tỉnh / Bang / Vùng',
  cityLabel: 'Thành phố / Quận / Huyện',
  customCityPlaceholder: 'Nhập thành phố nơi bạn sinh sống...',
  roleTitle: 'Vai trò / Sở thích chính trong cộng đồng',
  roleDesc: 'Dành cho cosplayer, fan idol (wota), otaku, thợ thủ công (crafter) và những người ủng hộ!',
  roleOthers: 'Khác / Vai trò tùy chỉnh',
  roleOthersPlaceholder: 'Nêu vai trò hoặc chuyên môn riêng của bạn trong cộng đồng...',
  fandomTitle: 'Fandom / Series yêu thích',
  fandomDesc: 'Chọn hoặc ghi anime, game, fandom hoặc nhóm idol mà bạn yêu thích.',
  fandomOther: 'Khác / Đa thể loại',
  experienceTitle: 'Kinh nghiệm trong giới Pop Culture / Cosplay',
  experienceDesc: 'Bạn đã tham gia giới cosplay / pop culture được bao lâu rồi?',
  socialMediaTitle: 'Tài khoản mạng xã hội',
  socialMediaDesc: 'Tên tài khoản Instagram, TikTok, X hoặc liên kết hồ sơ (không bắt buộc).',
  socialMediaPlaceholder: 'Câu trả lời của bạn (ví dụ: @cosplay_name)',
  portfolioTitle: 'Portfolio / Liên kết Google Drive',
  portfolioDesc: 'Liên kết Google Drive hoặc trang web portfolio (không bắt buộc).',
  portfolioPlaceholder: 'Câu trả lời của bạn (https://drive.google.com/...)',
  avatarTitle: 'Ảnh đại diện / Ảnh cosplay',
  avatarDesc:
    'Tải lên ảnh cosplay hoặc ảnh nhân vật của bạn cho Thẻ số, hoặc chọn một ảnh đại diện có sẵn bên dưới.',
  uploadButton: 'Tải ảnh lên (Tối đa 2MB)',
  presetAvatarLabel: 'Hoặc chọn một hình minh họa có sẵn:',
  reasonTitle: 'Lý do tham gia & Mong đợi',
  reasonDesc:
    'Lý do tham gia hoặc mong đợi của bạn (ví dụ: kết bạn đi sự kiện, học làm đạo cụ, chụp ảnh nhóm).',
  reasonPlaceholder: 'Câu trả lời của bạn...',
  codeOfConductTitle: 'Đồng ý với Quy tắc ứng xử của cộng đồng',
  codeOfConductAgreement:
    'Tôi đồng ý với Quy tắc ứng xử của KawanCosplay (100% SFW, tôn trọng lẫn nhau, tuyệt đối không quấy rối, không gian an toàn và thân thiện)',
  submitButton: 'Gửi đăng ký',
  submittingText: 'Đang gửi...',
  clearForm: 'Xóa biểu mẫu',
  responseRecorded: 'Câu trả lời của bạn đã được ghi nhận! Chào mừng bạn đến với KawanCosplay.',
  singleAccountIdTitle: 'Tài khoản KCC ID duy nhất của bạn (16 chữ số)',
  whatsappUnlockedBadge: 'Đã mở khóa nhóm cộng đồng WhatsApp',
  whatsappUnlockedTitle: 'Tham gia nhóm WhatsApp chính thức của KawanCosplay',
  whatsappUnlockedDesc:
    'Cảm ơn bạn đã đăng ký! Nhấn nút bên dưới để tham gia nhóm cộng đồng WhatsApp chính thức của KawanCosplay:',
  joinWhatsappButton: 'Tham gia nhóm cộng đồng WhatsApp',
  viewMyKccId: 'Xem & tải thẻ số của tôi',
  submitAnother: 'Gửi câu trả lời khác',

  // Generic form bits
  optionalTag: '(Tùy chọn)',
  officialHotlineLabel: 'Hotline WhatsApp chính thức:',
  needHelpHotline: 'Cần hỗ trợ? Hotline WhatsApp:',
  clearFormConfirm: 'Xóa toàn bộ thông tin đã nhập trong đơn?',

  // Backup WhatsApp number
  addBackupPhone: '+ Bạn có nhiều số WhatsApp? Thêm số dự phòng (Tùy chọn)',
  backupPhoneLabel: 'Số WhatsApp dự phòng / bổ sung',
  removeBackupPhone: 'Hủy / Xóa',
  backupPhoneNotice:
    'Số này được lưu làm số dự phòng. Nếu bạn điền lại đơn khi đã đăng nhập bằng cùng một tài khoản, KCC ID của bạn vẫn giữ nguyên; các lần đăng ký trùng lặp không đăng nhập sẽ được admin gộp lại.',
  backupPhonePlaceholder: 'Ví dụ: 08123456789 hoặc +62 857...',

  // Location (option labels only; the stored values stay 'Kustom / Wilayah Lainnya' / 'Kustom / Kota Lainnya')
  customProvinceOption: 'Tùy chỉnh / Khu vực khác',
  customCityOption: 'Tùy chỉnh / Thành phố khác',
  customProvincePlaceholder: 'Nhập bang / tỉnh / khu vực của bạn...',

  // Primary role labels (the stored primaryRole values are unchanged)
  roleCosplayer: 'Cosplayer / Crossplayer',
  roleIdolFan: 'Fan idol / Wota (J-Pop, K-Pop, 48 Group, Chika Idol, VTuber)',
  roleOtaku: 'Otaku Anime, Manga & Game (Người yêu thích anime, game & pop culture)',
  roleGeneralEnthusiast:
    'Người yêu thích chung / Người ủng hộ (Bạn bè, người ủng hộ & người tham gia buổi gặp mặt)',
  rolePropMaker: 'Thợ làm đạo cụ / Crafter (Chế tác vũ khí, giáp & phụ kiện)',
  rolePhotographer: 'Nhiếp ảnh gia / Quay phim cosplay',
  roleCostumeMaker: 'Người làm trang phục / Thợ may / Thợ tạo kiểu wig',
  roleEventCrew: 'Ekip sự kiện, nhân viên sân khấu & tình nguyện viên',
  roleContentCreator: 'Nhà sáng tạo nội dung / Streamer',

  // Fandom labels (the stored fandom values are unchanged)
  fandomHoyoverse: 'HoYoverse (Genshin Impact, Honkai: Star Rail, ZZZ)',
  fandomShonenSeinen: 'Anime & Manga thể loại Shonen / Seinen (JJK, Demon Slayer, Chainsaw Man, One Piece)',
  fandomIdolMusic: 'Idol & Âm nhạc (Love Live!, 48 Group, Bang Dream, Idolmaster, K-Pop)',
  fandomIsekaiFantasy: 'Isekai & Giả tưởng (Frieren, Slime, Re:Zero, DanMachi)',
  fandomGamingEsports: 'Game & Thể thao điện tử (Valorant, League of Legends, MLBB, Elden Ring)',
  fandomVtuber: 'VTuber (Hololive, Nijisanji, VTuber độc lập)',
  fandomTokusatsuMecha: 'Tokusatsu & Mecha (Kamen Rider, Super Sentai, Gundam)',
  fandomWesternPopCulture: 'Pop Culture phương Tây (Marvel, DC, Star Wars, Disney)',
  fandomOriginalCharacter: 'Nhân vật nguyên bản (OC) & Giả tưởng sáng tạo',

  // Experience labels (the stored experience values are unchanged)
  experienceBeginner: 'Người mới (< 1 năm)',
  experienceOneToThreeYears: '1 - 3 năm',
  experienceVeteran: 'Kỳ cựu (> 3 năm)',
  experienceCasual: 'Chơi cho vui / Người yêu thích',

  // Avatar
  avatarTooLarge: 'Ảnh đại diện có dung lượng tối đa {maxMb}MB.',
  photoProcessFailed: 'Không thể xử lý ảnh.',
  avatarPreviewAlt: 'Xem trước ảnh đại diện',
  presetAvatarAria: 'Ảnh đại diện có sẵn {number}',

  // Validation errors
  nameRequiredError: 'Vui lòng nhập Tên cosplay / Biệt danh / Nghệ danh của bạn.',
  emailRequiredError: 'Vui lòng nhập địa chỉ email.',
  whatsappRequiredError:
    'Cần có số di động WhatsApp hợp lệ (tối thiểu {minDigits} chữ số) vì KawanCosplay là cộng đồng hoạt động trên WhatsApp.',
  backupPhoneTooShortError: 'Số WhatsApp dự phòng cần ít nhất {minDigits} chữ số (hoặc để trống).',
  customCityRequiredError: 'Vui lòng nhập thành phố / quận huyện của bạn (lựa chọn "{option}").',
  codeOfConductRequiredError: 'Vui lòng đánh dấu đồng ý với Quy tắc ứng xử của KawanCosplay Community.',

  // Demo sandbox (admin only)
  sandboxActiveNotice:
    'Chế độ Sandbox đang bật: Bài thử nghiệm demo này được tách biệt và sẽ KHÔNG được lưu vào cơ sở dữ liệu Firestore.',
  exitSandbox: 'Thoát Sandbox',
  sandboxSubmissionNotice:
    '🧪 Thử nghiệm demo trong Sandbox: Bài thử này chạy trong bộ nhớ cục bộ và KHÔNG được lưu vào cơ sở dữ liệu.',

  // Success screen
  duplicateMergedNotice:
    '✓ Thông tin của bạn trùng với một lần đăng ký trước đó. Mỗi thành viên chỉ có một KCC ID duy nhất — KCC ID của bạn vẫn giữ nguyên và hồ sơ của bạn đã được cập nhật.',
  verifiedMemberLabel: 'Thành viên đã xác minh:',
  discordValue: 'Discord: {username}',

  // Prefilled WhatsApp message to the admins (one line each; optional lines are left out)
  whatsappMessageIntro: 'Xin chào Admin KawanCosplay! Mình đã điền đơn đăng ký thành viên.',
  whatsappMessageName: 'Tên: {name}',
  whatsappMessageKccId: 'KCC ID: {id}',
  whatsappMessagePhone: 'Số WhatsApp: {phone}',
  whatsappMessagePhone2: 'Số WhatsApp 2: {phone}',
  whatsappMessageRequest:
    'Vui lòng gửi cho mình liên kết mời vào nhóm WhatsApp của KawanCosplay Community. Cảm ơn!',
};

export default registration;
