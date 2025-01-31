module.exports = () => {
    const SelectAdapter_GioiTinh = [
        { id: '1', text: 'Nam' },
        { id: '2', text: 'Nữ' }
    ];

    const SelectAdapter_DanToc = [
        { id: '00', text: 'Chưa xác định' },
        { id: '01', text: 'Kinh (Việt)' },
        { id: '02', text: 'Tày' },
        { id: '03', text: 'Thái' },
        { id: '04', text: 'Mường' },
        { id: '05', text: 'Khơ me' },
        { id: '06', text: 'Hoa (Hán)' },
        { id: '07', text: 'Nùng' },
        { id: '08', text: 'H\'mông (Mèo)' },
        { id: '09', text: 'Dao' },
        { id: '10', text: 'Gia - rai' },
        { id: '11', text: 'Ê-đê' },
        { id: '12', text: 'Ba-na' },
        { id: '13', text: 'Sán Chay (Cao Lan-Sán Chỉ)' },
        { id: '14', text: 'Chăm (Chàm)' },
        { id: '15', text: 'Cơ-ho' },
        { id: '16', text: 'Xơ-đăng' },
        { id: '17', text: 'Sán Dìu' },
        { id: '18', text: 'Hrê' },
        { id: '19', text: 'Ra-glai' },
        { id: '20', text: 'Mnông' },
        { id: '21', text: 'Thổ' },
        { id: '22', text: 'XTiêng' },
        { id: '23', text: 'Khơ-mú' },
        { id: '24', text: 'Bru-Vân Kiều' },
        { id: '25', text: 'Cơ-Tu' },
        { id: '26', text: 'Giáy' },
        { id: '27', text: 'Tà-ôi' },
        { id: '28', text: 'Mạ' },
        { id: '29', text: 'Gié-Triêng' },
        { id: '30', text: 'Co' },
        { id: '31', text: 'Chơ-ro' },
        { id: '32', text: 'Xinh-mun' },
        { id: '33', text: 'Hà Nhì' },
        { id: '34', text: 'Chu-ru' },
        { id: '35', text: 'Lào' },
        { id: '36', text: 'La Chí' },
        { id: '37', text: 'Kháng' },
        { id: '38', text: 'Phù Lá' },
        { id: '39', text: 'La Hủ' },
        { id: '40', text: 'La Ha' },
        { id: '41', text: 'Pà Thẻn' },
        { id: '42', text: 'Lự' },
        { id: '43', text: 'Ngái' },
        { id: '44', text: 'Chứt' },
        { id: '45', text: 'Lô Lô' },
        { id: '46', text: 'Mảng' },
        { id: '47', text: 'Cơ Lao' },
        { id: '48', text: 'Bố Y' },
        { id: '49', text: 'Cống' },
        { id: '50', text: 'Si La' },
        { id: '51', text: 'Pu Péo' },
        { id: '52', text: 'Rơ-măm' },
        { id: '53', text: 'Brâu' },
        { id: '54', text: 'Ơ Đu' },
        { id: '55', text: 'Người nước ngoài' }
    ];

    const SelectAdapter_TonGiao = [
        { id: '00', text: 'Chưa xác định' },
        { id: '01', text: 'Phật giáo' },
        { id: '02', text: 'Công giáo' },
        { id: '03', text: 'Phật giáo Hoà Hảo' },
        { id: '04', text: 'Hồi giáo' },
        { id: '05', text: 'Cao Đài' },
        { id: '06', text: 'Minh sư đạo' },
        { id: '07', text: 'Minh Lý đạo' },
        { id: '08', text: 'Tin Lành' },
        { id: '09', text: 'Tịnh độ cư sĩ Phật hội Việt Nam' },
        { id: '10', text: 'Đạo Tứ ấn hiếu nghĩa' },
        { id: '11', text: 'Bửu sơn Kỳ hương' },
        { id: '12', text: 'Đạo Bahá\'í' },
        { id: '13', text: 'Bà La Môn' },
        { id: '14', text: 'Mặc Môn' },
        { id: '15', text: 'Tôn giáo khác' },
        { id: '99', text: 'Không theo tôn giáo nào' }
    ];

    const SelectAdapter_TrinhDoPhoThong = [
        { id: '00', text: 'Chưa xác định' },
        { id: '08', text: '8/10' },
        { id: '09', text: '9/10' },
        { id: '10', text: '10/10' },
        { id: '19', text: '9/12' },
        { id: '20', text: '10/12' },
        { id: '21', text: '11/12' },
        { id: '22', text: '12/12' },
        { id: '30', text: '8/10 Bổ túc' },
        { id: '31', text: '9/10 Bổ túc' },
        { id: '32', text: '10/10 Bổ túc' },
        { id: '41', text: '9/12 Bổ túc' },
        { id: '42', text: '10/12 Bổ túc' },
        { id: '43', text: '11/12 Bổ túc' },
        { id: '44', text: '12/12 Bổ túc' }
    ];

    const SelectAdapter_HocVi = [
        { id: '01', text: 'Tiến sĩ khoa học' },
        { id: '02', text: 'Tiến sĩ' },
        { id: '03', text: 'Thạc sĩ' },
        { id: '04', text: 'Cử nhân (Đại học)' },
        { id: '05', text: 'Kỹ sư' },
        { id: '06', text: 'Cao đẳng' },
        { id: '07', text: 'Trung cấp' },
        { id: '08', text: 'Sơ cấp' },
        { id: '09', text: 'Chưa xác định' },
        { id: '10', text: 'Cử nhân (Cao đẳng)' },
        { id: '11', text: 'Bác sĩ chuyên khoa I' },
        { id: '12', text: 'Bác sĩ chuyên khoa II' },
        { id: '13', text: 'Dược sỹ chuyên khoa I' },
        { id: '14', text: 'Dược sỹ chuyên khoa II' },
        { id: '15', text: 'Điều dưỡng chuyên khoa I' },
        { id: '16', text: 'Điều dưỡng chuyên khoa II' },
        { id: '9999', text: 'Dưới trung cấp' }
    ];

    const SelectAdapter_DanhHieu = [
        { id: '00', text: 'Chưa xác định' },
        { id: '01', text: 'Huân chương Sao vàng' },
        { id: '02', text: 'Huân chương Hồ Chí Minh' },
        { id: '03', text: 'Huân chương Độc lập hạng nhất' },
        { id: '04', text: 'Huân chương Độc lập hạng nhì' },
        { id: '05', text: 'Huân chương Độc lập hạng ba' },
        { id: '06', text: 'Huân chương Quân công hạng nhất' },
        { id: '07', text: 'Huân chương Quân công hạng nhì' },
        { id: '08', text: 'Huân chương Quân công hạng ba' },
        { id: '09', text: 'Huân chương Lao động hạng nhất' },
        { id: '10', text: 'Huân chương Lao động hạng nhì' },
        { id: '11', text: 'Huân chương Lao động hạng ba' },
        { id: '12', text: 'Huân chương Bảo vệ Tổ quốc hạng nhất' },
        { id: '13', text: 'Huân chương Bảo vệ Tổ quốc hạng nhì' },
        { id: '14', text: 'Huân chương Bảo vệ Tổ quốc hạng ba' },
        { id: '15', text: 'Huân chương Chiến công hạng nhất' },
        { id: '16', text: 'Huân chương Chiến công hạng nhì' },
        { id: '17', text: 'Huân chương Chiến công hạng ba' },
        { id: '18', text: 'Huân chương Đại đoàn kết dân tộc' },
        { id: '19', text: 'Huân chương Dũng cảm' },
        { id: '20', text: 'Huân chương Hữu nghị' },
        { id: '21', text: 'Huy chương Quân kỳ quyết thắng' },
        { id: '22', text: 'Huy chương Vì an ninh Tổ quốc' },
        { id: '23', text: 'Huy chương Chiến sỹ vẻ vang hạng nhất' },
        { id: '24', text: 'Huy chương Chiến sỹ vẻ vang hạng nhì' },
        { id: '25', text: 'Huy chương Chiến sỹ vẻ vang hạng ba' },
        { id: '26', text: 'Huy chương Hữu nghị' },
        { id: '27', text: 'Bà mẹ Việt Nam Anh hùng' },
        { id: '28', text: 'Anh hùng Lực lượng vũ trang nhân dân' },
        { id: '29', text: 'Anh hùng Lao động' },
        { id: '30', text: 'Nhà giáo nhân dân' },
        { id: '31', text: 'Nhà giáo ưu tú' },
        { id: '32', text: 'Thầy thuốc nhân dân' },
        { id: '33', text: 'Thầy thuốc ưu tú' },
        { id: '34', text: 'Nghệ sĩ nhân dân' },
        { id: '35', text: 'Nghệ sĩ ưu tú' },
        { id: '36', text: 'Nghệ nhân nhân dân' },
        { id: '37', text: 'Nghệ nhân ưu tú' },
        { id: '38', text: 'Giải thưởng Hồ Chí Minh' },
        { id: '39', text: 'Giải thưởng Nhà nước' },
        { id: '40', text: 'Kỷ niệm chương và Huy hiệu' },
        { id: '41', text: 'Bằng khen của Thủ tướng Chính phủ' },
        { id: '42', text: 'Bằng khen cấp Bộ, ngành, tỉnh, đoàn thể trung ương' },
        { id: '43', text: 'Giấy khen' },
        { id: '44', text: 'Chiến sỹ thi đua toàn quốc' },
        { id: '46', text: 'Chiến sỹ thi đua cơ sở' },
        { id: '47', text: 'Lao động tiên tiến' },
        { id: '48', text: 'Chiến sỹ tiên tiến' },
        { id: '49', text: 'Cờ thi đua của Chính phủ' },
        { id: '50', text: 'Cờ thi đua cấp Bộ, ngành, tỉnh, đoàn thể trung ương' },
        { id: 'GTLTT', text: 'Giải thưởng Lý Tự Trọng' },
        { id: 'GTTVO', text: 'Giải thưởng Trần Văn Ơn' },
        { id: 'GTHTLO', text: 'Giải thưởng Hải Thượng Lãn Ông' },
        { id: 'KHKTTN', text: 'Giải thường Khoa học kỹ thuật thanh niên' },
        { id: '51', text: 'Khác' }
    ];

    const SelectAdapter_HocHam = [
        { id: '00', text: 'Chưa xác định' },
        { id: '01', text: 'Giáo sư' },
        { id: '02', text: 'Phó giáo sư' },
        { id: '99', text: 'Khác' },
    ];

    const SelectAdapter_ChucVu = [
        { id: '008', text: 'Giám đốc ĐHQG-HCM' },
        { id: '009', text: 'Phó Giám đốc ĐHQG-HCM' },
        {
            id: '010',
            text: 'Chánh Văn phòng và Trưởng ban các ban chức năng ĐHQG-HCM'
        },
        {
            id: '011',
            text: 'Phó Chánh Văn phòng và Phó Trưởng ban các ban chức năng ĐHQG-HCM'
        },
        { id: '012', text: 'Trưởng phòng thuộc Văn phòng ĐHQG-HCM' },
        { id: '013', text: 'Phó Trưởng phòng thuộc Văn phòng ĐHQG-HCM' },
        { id: '108', text: 'Viện trưởng trực thuộc ĐHQG-HCM' },
        { id: '109', text: 'Phó Viện trưởng trực thuộc ĐHQG-HCM' },
        { id: '114', text: 'Thủ trưởng đơn vị trực thuộc ĐHQG-HCM' },
        { id: '115', text: 'Phó Thủ trưởng đơn vị trực thuộc ĐHQG-HCM' },
        { id: '116', text: 'Hiệu trưởng' },
        { id: '117', text: 'Phó hiệu trưởng' },
        { id: '118', text: 'Trưởng khoa và tương đương trực thuộc trường' },
        {
            id: '119',
            text: 'Phó Trưởng khoa và tương đương trực thuộc trường'
        },
        { id: '120', text: 'Trưởng ban thuộc đơn vị' },
        { id: '121', text: 'Phó Trưởng ban thuộc đơn vị' },
        { id: '122', text: 'Trưởng phòng và tương đương' },
        { id: '123', text: 'Phó Trưởng phòng và tương đương' },
        {
            id: '124',
            text: 'Giám đốc tổ chức sự nghiệp thuộc Trường/Viện/Trung tâm'
        },
        {
            id: '125',
            text: 'Phó Giám đốc tổ chức sự nghiệp thuộc Trường/Viện/Trung tâm'
        },
        { id: '168', text: 'Trưởng trạm Y tế' },
        { id: '169', text: 'Phó Trưởng trạm Y tế' },
        { id: 'KCT', text: 'Trưởng Bộ môn' },
        { id: 'KHAC', text: 'Chủ tịch Hội đồng trường' }
    ];

    const SelectAdapter_ChucVuDang = [
        {
            id: '07',
            text: 'Ủy viên Ủy ban kiểm tra cơ sở Đảng trực thuộc Đảng ủy ĐHQG-HCM'
        },
        {
            id: '09',
            text: 'Bí thư Chi bộ trực thuộc Đảng bộ cơ sở thuộc Đảng bộ ĐHQG-HCM'
        },
        {
            id: '10',
            text: 'Phó Bí thư chi bộ trực thuộc Đảng bộ cơ sở thuộc Đảng bộ ĐHQG-HCM'
        },
        { id: '18', text: 'Ủy viên Ban Chấp hành Đảng bộ ĐHQG-HCM' },
        { id: '19', text: 'Ủy viên Ban Thường vụ Đảng bộ ĐHQG-HCM' },
        { id: '20', text: 'Phó Bí thư Đảng bộ ĐHQG-HCM' },
        { id: '21', text: 'Bí thư Đảng bộ ĐHQG-HCM' },
        {
            id: '22',
            text: 'Ủy viên Ban Chấp hành Đảng bộ cơ sở trực thuộc Đảng ủy ĐHQG-HCM'
        },
        {
            id: '23',
            text: 'Ủy viên Ban Thường vụ Đảng bộ cơ sở trực thuộc Đảng ủy ĐHQG-HCM'
        },
        {
            id: '24',
            text: 'Phó Bí thư Đảng bộ cơ sở trực thuộc Đảng ủy ĐHQG-HCM'
        },
        {
            id: '25',
            text: 'Bí thư Đảng bộ cơ sở trực thuộc Đảng ủy ĐHQG-HCM'
        },
        {
            id: '26',
            text: 'Cấp ủy chi bộ trực thuộc Đảng bộ cơ sở thuộc Đảng bộ ĐHQG-HCM'
        },
        { id: '27', text: 'Phó Bí thư chi bộ trực thuộc Đảng ủy ĐHQG-HCM' },
        { id: '28', text: 'Bí thư chi bộ trực thuộc Đảng ủy ĐHQG-HCM' },
        { id: '29', text: 'Ủy viên Ủy ban kiểm tra Đảng ủy ĐHQG-HCM' }
    ];

    const SelectAdapter_BacLuong = [
        { id: '01', text: '1' },
        { id: '02', text: '2' },
        { id: '03', text: '3' },
        { id: '04', text: '4' },
        { id: '05', text: '5' },
        { id: '06', text: '6' },
        { id: '07', text: '7' },
        { id: '08', text: '8' },
        { id: '09', text: '9' },
        { id: '10', text: '10' },
        { id: '11', text: '11' },
        { id: '12', text: '12' },
        { id: '13', text: '13' },
        { id: '14', text: '14' },
        { id: '15', text: '15' },
        { id: '16', text: '16' }
    ];

    const SelectAdapter_NgachLuong = [
        {
            id: '0',
            text: '0: Chưa xác định',
            ten: 'Chưa xác định'
        },
        {
            id: '01.001',
            text: '01.001: Chuyên viên cao cấp',
            ten: 'Chuyên viên cao cấp'
        },
        {
            id: '04.023',
            text: '04.023: Thanh tra viên cao cấp',
            ten: 'Thanh tra viên cao cấp'
        },
        {
            id: '06.036',
            text: '06.036: Kiểm soát viên cao cấp thuế',
            ten: 'Kiểm soát viên cao cấp thuế'
        },
        {
            id: '06.041',
            text: '06.041: Kiểm toán viên cao cấp',
            ten: 'Kiểm toán viên cao cấp'
        },
        {
            id: '07.044',
            text: '07.044: Kiểm soát viên cao cấp ngân hàng',
            ten: 'Kiểm soát viên cao cấp ngân hàng'
        },
        {
            id: '08.049',
            text: '08.049: Kiểm tra viên cao cấp hải quan',
            ten: 'Kiểm tra viên cao cấp hải quan'
        },
        {
            id: '12.084',
            text: '12.084: Thẩm kế viên cao cấp',
            ten: 'Thẩm kế viên cao cấp'
        },
        {
            id: '21.187',
            text: '21.187: Kiểm soát viên cao cấp thị trường',
            ten: 'Kiểm soát viên cao cấp thị trường'
        },
        {
            id: '23.261',
            text: '23.261: Thống kê viên cao cấp',
            ten: 'Thống kê viên cao cấp'
        },
        {
            id: '13.280',
            text: '13.280: Kiểm soát viên cao cấp chất lượng sản phẩm, hàng hóa ',
            ten: 'Kiểm soát viên cao cấp chất lượng sản phẩm, hàng hóa '
        },
        {
            id: '03.299',
            text: '03.299: Chấp hành viên cao cấp',
            ten: 'Chấp hành viên cao cấp'
        },
        {
            id: '03.230',
            text: '03.230: Thẩm tra viên cao cấp',
            ten: 'Thẩm tra viên cao cấp'
        },
        {
            id: '06.029',
            text: '06.029: Kế toán viên cao cấp',
            ten: 'Kế toán viên cao cấp'
        },
        {
            id: '09.066',
            text: '09.066: Kiểm dịch viên cao cấp động thực vật',
            ten: 'Kiểm dịch viên cao cấp động thực vật'
        },
        {
            id: '01.002',
            text: '01.002: Chuyên viên chính',
            ten: 'Chuyên viên chính'
        },
        {
            id: '03.017',
            text: '03.017: Chấp hành viên tỉnh, thành phố trực thuộc Trung ương ',
            ten: 'Chấp hành viên tỉnh, thành phố trực thuộc Trung ương '
        },
        {
            id: '04.024',
            text: '04.024: Thanh tra viên chính',
            ten: 'Thanh tra viên chính'
        },
        {
            id: '06.037',
            text: '06.037: Kiểm soát viên chính thuế',
            ten: 'Kiểm soát viên chính thuế'
        },
        {
            id: '06.042',
            text: '06.042: Kiểm toán viên chính',
            ten: 'Kiểm toán viên chính'
        },
        {
            id: '07.045',
            text: '07.045: Kiểm soát viên chính ngân hàng',
            ten: 'Kiểm soát viên chính ngân hàng'
        },
        {
            id: '08.050',
            text: '08.050: Kiểm tra viên chính hải quan',
            ten: 'Kiểm tra viên chính hải quan'
        },
        {
            id: '12.085',
            text: '12.085: Thẩm kế viên chính',
            ten: 'Thẩm kế viên chính'
        },
        {
            id: '21.188',
            text: '21.188: Kiểm soát viên chính thị trường',
            ten: 'Kiểm soát viên chính thị trường'
        },
        {
            id: '02.006',
            text: '02.006: Văn thư chính',
            ten: 'Văn thư chính'
        },
        {
            id: '23.262',
            text: '23.262: Thống kê viên chính',
            ten: 'Thống kê viên chính'
        },
        {
            id: '13.281',
            text: '13.281: Kiểm soát viên chính chất lượng sản phẩm, hàng hoá ',
            ten: 'Kiểm soát viên chính chất lượng sản phẩm, hàng hoá '
        },
        {
            id: '03.231',
            text: '03.231: Thẩm tra viên chính',
            ten: 'Thẩm tra viên chính'
        },
        {
            id: '09.315',
            text: '09.315: Kiểm dịch viên chính động vật',
            ten: 'Kiểm dịch viên chính động vật'
        },
        {
            id: '09.318',
            text: '09.318: Kiểm dịch viên chính thực vật',
            ten: 'Kiểm dịch viên chính thực vật'
        },
        {
            id: '25.309',
            text: '25.309: Kiểm ngư viên chính',
            ten: 'Kiểm ngư viên chính'
        },
        {
            id: '25.312',
            text: '25.312: Thuyền viên kiểm ngư chính',
            ten: 'Thuyền viên kiểm ngư chính'
        },
        {
            id: '06.030',
            text: '06.030: Kế toán viên chính',
            ten: 'Kế toán viên chính'
        },
        {
            id: '09.067',
            text: '09.067: Kiểm dịch viên chính động - thực vật',
            ten: 'Kiểm dịch viên chính động - thực vật'
        },
        {
            id: '11.081',
            text: '11.081: Kiểm soát viên chính đê điều',
            ten: 'Kiểm soát viên chính đê điều'
        },
        {
            id: '01.003',
            text: '01.003: Chuyên viên',
            ten: 'Chuyên viên'
        },
        {
            id: '03.018',
            text: '03.018: Chấp hành viên quận, huyện, thị xã, thành phố thuộc tỉnh',
            ten: 'Chấp hành viên quận, huyện, thị xã, thành phố thuộc tỉnh'
        },
        {
            id: '03.019',
            text: '03.019: Công chứng viên',
            ten: 'Công chứng viên'
        },
        {
            id: '04.025',
            text: '04.025: Thanh tra viên',
            ten: 'Thanh tra viên'
        },
        {
            id: '06.031',
            text: '06.031: Kế toán viên',
            ten: 'Kế toán viên'
        },
        {
            id: '06.038',
            text: '06.038: Kiểm soát viên thuế',
            ten: 'Kiểm soát viên thuế'
        },
        {
            id: '06.043',
            text: '06.043: Kiểm toán viên',
            ten: 'Kiểm toán viên'
        },
        {
            id: '07.046',
            text: '07.046: Kiểm soát viên ngân hàng',
            ten: 'Kiểm soát viên ngân hàng'
        },
        {
            id: '08.051',
            text: '08.051: Kiểm tra viên hải quan',
            ten: 'Kiểm tra viên hải quan'
        },
        {
            id: '09.068',
            text: '09.068: Kiểm dịch viên động - thực vật',
            ten: 'Kiểm dịch viên động - thực vật'
        },
        {
            id: '09.316',
            text: '09.316: Kiểm dịch viên động vật',
            ten: 'Kiểm dịch viên động vật'
        },
        {
            id: '09.319',
            text: '09.319: Kiểm dịch viên thực vật',
            ten: 'Kiểm dịch viên thực vật'
        },
        {
            id: '25.310',
            text: '25.310: Kiểm ngư viên',
            ten: 'Kiểm ngư viên'
        },
        {
            id: '25.313',
            text: '25.313: Thuyền viên kiểm ngư',
            ten: 'Thuyền viên kiểm ngư'
        },
        {
            id: '23.263',
            text: '23.263: Thống kê viên',
            ten: 'Thống kê viên'
        },
        {
            id: '10.225',
            text: '10.225: Kiểm lâm viên chính',
            ten: 'Kiểm lâm viên chính'
        },
        {
            id: '11.082',
            text: '11.082: Kiểm soát viên đê điều',
            ten: 'Kiểm soát viên đê điều'
        },
        {
            id: '12.086',
            text: '12.086: Thẩm kế viên',
            ten: 'Thẩm kế viên'
        },
        {
            id: '21.189',
            text: '21.189: Kiểm soát viên thị trường',
            ten: 'Kiểm soát viên thị trường'
        },
        {
            id: '02.007',
            text: '02.007: Văn thư',
            ten: 'Văn thư'
        },
        {
            id: '01.004',
            text: '01.004: Cán sự',
            ten: 'Cán sự'
        },
        {
            id: '06.032',
            text: '06.032: Kế toán viên trung cấp',
            ten: 'Kế toán viên trung cấp'
        },
        {
            id: '06.039',
            text: '06.039: Kiểm thu viên thuế',
            ten: 'Kiểm thu viên thuế'
        },
        {
            id: '13.282',
            text: '13.282: Kiểm soát viên chất lượng sản phẩm, hàng hóa',
            ten: 'Kiểm soát viên chất lượng sản phẩm, hàng hóa'
        },
        {
            id: '07.048',
            text: '07.048: Thủ kho tiền, vàng bạc, đá quý (ngân hàng) ',
            ten: 'Thủ kho tiền, vàng bạc, đá quý (ngân hàng) '
        },
        {
            id: '08.052',
            text: '08.052: Kiểm tra viên trung cấp hải quan',
            ten: 'Kiểm tra viên trung cấp hải quan'
        },
        {
            id: '09.069',
            text: '09.069: Kỹ thuật viên kiểm dịch động - thực vật ',
            ten: 'Kỹ thuật viên kiểm dịch động - thực vật '
        },
        {
            id: '10.226',
            text: '10.226: Kiểm lâm viên',
            ten: 'Kiểm lâm viên'
        },
        {
            id: '03.302',
            text: '03.302: Thư ký thi hành án',
            ten: 'Thư ký thi hành án'
        },
        {
            id: '03.232',
            text: '03.232: Thẩm tra viên',
            ten: 'Thẩm tra viên'
        },
        {
            id: '19.221',
            text: '19.221: Kỹ thuật viên bảo quản',
            ten: 'Kỹ thuật viên bảo quản'
        },
        {
            id: '23.265',
            text: '23.265: Thống kê viên trung cấp',
            ten: 'Thống kê viên trung cấp'
        },
        {
            id: '11.083',
            text: '11.083: Kiểm soát viên trung cấp đê điều ',
            ten: 'Kiểm soát viên trung cấp đê điều '
        },
        {
            id: '19.183',
            text: '19.183: Kỹ thuật viên kiểm nghiệm bảo quản ',
            ten: 'Kỹ thuật viên kiểm nghiệm bảo quản '
        },
        {
            id: '21.190',
            text: '21.190: Kiểm soát viên trung cấp thị trường ',
            ten: 'Kiểm soát viên trung cấp thị trường '
        },
        {
            id: '02.008',
            text: '02.008: Văn thư trung cấp',
            ten: 'Văn thư trung cấp'
        },
        {
            id: '13.283',
            text: '13.283: Kiểm soát viên trung cấp chất lượng sản phẩm, hàng hóa ',
            ten: 'Kiểm soát viên trung cấp chất lượng sản phẩm, hàng hóa '
        },
        {
            id: '03.300',
            text: '03.300: Chấp hành viên trung cấp',
            ten: 'Chấp hành viên trung cấp'
        },
        {
            id: '03.303',
            text: '03.303: Thư ký trung cấp thi hành án',
            ten: 'Thư ký trung cấp thi hành án'
        },
        {
            id: '10.228',
            text: '10.228: Kiểm lâm viên trung cấp',
            ten: 'Kiểm lâm viên trung cấp'
        },
        {
            id: '19.222',
            text: '19.222: Kỹ thuật viên bảo quản trung cấp',
            ten: 'Kỹ thuật viên bảo quản trung cấp'
        },
        {
            id: '23.264',
            text: '23.264: Thống kê viên trình độ cao đẳng ',
            ten: 'Thống kê viên trình độ cao đẳng '
        },
        {
            id: '06a.038',
            text: '06a.038: Kiểm tra viên cao đẳng thuế ',
            ten: 'Kiểm tra viên cao đẳng thuế '
        },
        {
            id: '08a.051',
            text: '08a.051: Kiểm tra viên cao đẳng hải quan',
            ten: 'Kiểm tra viên cao đẳng hải quan'
        },
        {
            id: '06a.031',
            text: '06a.031: Kế toán viên cao đẳng',
            ten: 'Kế toán viên cao đẳng'
        },
        {
            id: '10.227',
            text: '10.227: Kiểm lâm viên trình độ cao đẳng ',
            ten: 'Kiểm lâm viên trình độ cao đẳng '
        },
        {
            id: '09.317',
            text: '09.317: Kỹ thuật viên kiểm dịch động vật ',
            ten: 'Kỹ thuật viên kiểm dịch động vật '
        },
        {
            id: '09.320',
            text: '09.320: Kỹ thuật viên kiểm dịch thực vật ',
            ten: 'Kỹ thuật viên kiểm dịch thực vật '
        },
        {
            id: '25.311',
            text: '25.311: Kiểm ngư viên trung cấp',
            ten: 'Kiểm ngư viên trung cấp'
        },
        {
            id: '25.314',
            text: '25.314: Thuyền viên kiểm ngư trung cấp ',
            ten: 'Thuyền viên kiểm ngư trung cấp '
        },
        {
            id: '01.005',
            text: '01.005: Nhân viên',
            ten: 'Nhân viên'
        },
        {
            id: '03.301',
            text: '03.301: Chấp hành viên sơ cấp',
            ten: 'Chấp hành viên sơ cấp'
        },
        {
            id: '06.034',
            text: '06.034: Thủ quỹ kho bạc, ngân hàng ',
            ten: 'Thủ quỹ kho bạc, ngân hàng '
        },
        {
            id: '07.047',
            text: '07.047: Kiểm ngân viên',
            ten: 'Kiểm ngân viên'
        },
        {
            id: '08.053',
            text: '08.053: Nhân viên hải quan',
            ten: 'Nhân viên hải quan'
        },
        {
            id: '10.229',
            text: '10.229: Kiểm lâm viên sơ cấp',
            ten: 'Kiểm lâm viên sơ cấp'
        },
        {
            id: '19.224',
            text: '19.224: Nhân viên bảo vệ kho dự trữ',
            ten: 'Nhân viên bảo vệ kho dự trữ'
        },
        {
            id: '19.184',
            text: '19.184: Thủ kho bảo quản nhóm I',
            ten: 'Thủ kho bảo quản nhóm I'
        },
        {
            id: '19.185',
            text: '19.185: Thủ kho bảo quản nhóm II',
            ten: 'Thủ kho bảo quản nhóm II'
        },
        {
            id: '19.186',
            text: '19.186: Bảo vệ, tuần tra canh gác',
            ten: 'Bảo vệ, tuần tra canh gác'
        },
        {
            id: '06.035',
            text: '06.035: Thủ quỹ cơ quan, đơn vị ',
            ten: 'Thủ quỹ cơ quan, đơn vị '
        },
        {
            id: '06.040',
            text: '06.040: Nhân viên thuế',
            ten: 'Nhân viên thuế'
        },
        {
            id: '06.033',
            text: '06.033: Ngạch kế toán viên sơ cấp',
            ten: 'Ngạch kế toán viên sơ cấp'
        },
        {
            id: 'V.04.01.01',
            text: 'V.04.01.01: Kiến trúc sư cao cấp',
            ten: 'Kiến trúc sư cao cấp'
        },
        {
            id: 'V.05.01.01',
            text: 'V.05.01.01: Nghiên cứu viên cao cấp',
            ten: 'Nghiên cứu viên cao cấp'
        },
        {
            id: 'V.05.02.05',
            text: 'V.05.02.05: Kỹ sư cao cấp',
            ten: 'Kỹ sư cao cấp'
        },
        {
            id: '13.097',
            text: '13.097: Định chuẩn viên cao cấp',
            ten: 'Định chuẩn viên cao cấp'
        },
        {
            id: '13.100',
            text: '13.100: Giám định viên cao cấp',
            ten: 'Giám định viên cao cấp'
        },
        {
            id: '14.103',
            text: '14.103: Dự báo viên cao cấp',
            ten: 'Dự báo viên cao cấp'
        },
        {
            id: 'V.07.01.01',
            text: 'V.07.01.01: Giáo sư/Phó giáo sư - giảng viên cao cấp',
            ten: 'Giáo sư/Phó giáo sư - giảng viên cao cấp'
        },
        {
            id: 'V.08.01.01',
            text: 'V.08.01.01: Bác sĩ cao cấp',
            ten: 'Bác sĩ cao cấp'
        },
        {
            id: 'V.08.08.20',
            text: 'V.08.08.20: Dược sĩ cao cấp',
            ten: 'Dược sĩ cao cấp'
        },
        {
            id: '17.139',
            text: '17.139: Biên tập - Biên kịch - Biên dịch viên cao cấp',
            ten: 'Biên tập - Biên kịch - Biên dịch viên cao cấp'
        },
        {
            id: 'V.11.01.01',
            text: 'V.11.01.01: Biên tập viên - Biên kịch viên cao cấp',
            ten: 'Biên tập viên - Biên kịch viên cao cấp'
        },
        {
            id: 'V.11.03.07',
            text: 'V.11.03.07: Biên dịch viên cao cấp',
            ten: 'Biên dịch viên cao cấp'
        },
        {
            id: 'V.11.02.04',
            text: 'V.11.02.04: Phóng viên - Bình luận viên cao cấp',
            ten: 'Phóng viên - Bình luận viên cao cấp'
        },
        {
            id: '17.154',
            text: '17.154: Đạo diễn cao cấp',
            ten: 'Đạo diễn cao cấp'
        },
        {
            id: 'V.11.04.10',
            text: 'V.11.04.10: Đạo diễn truyền hình hạng 1',
            ten: 'Đạo diễn truyền hình hạng 1'
        },
        {
            id: 'V.10.03.08',
            text: 'V.10.03.08: Đạo diễn nghệ thuật hạng 1',
            ten: 'Đạo diễn nghệ thuật hạng 1'
        },
        {
            id: 'V.10.04.12',
            text: 'V.10.04.12: Diễn viên hạng I',
            ten: 'Diễn viên hạng I'
        },
        {
            id: 'V.10.08.25',
            text: 'V.10.08.25: Họa sĩ cao cấp',
            ten: 'Họa sĩ cao cấp'
        },
        {
            id: 'V.10.01.01',
            text: 'V.10.01.01: Huấn luyện viên cao cấp',
            ten: 'Huấn luyện viên cao cấp'
        },
        {
            id: 'V.08.02.04',
            text: 'V.08.02.04: Bác sĩ y học dự phòng cao cấp (hạng I)',
            ten: 'Bác sĩ y học dự phòng cao cấp (hạng I)'
        },
        {
            id: 'V.08.02.05',
            text: 'V.08.02.05: Bác sĩ y học dự phòng chính (hạng II)',
            ten: 'Bác sĩ y học dự phòng chính (hạng II)'
        },
        {
            id: 'V.08.04.08',
            text: 'V.08.04.08: Y tế công cộng cao cấp (hạng I)',
            ten: 'Y tế công cộng cao cấp (hạng I)'
        },
        {
            id: 'V11.05.09',
            text: 'V11.05.09: An toàn thông tin hạng I',
            ten: 'An toàn thông tin hạng I'
        },
        {
            id: 'V11.06.12',
            text: 'V11.06.12: Quản trị viên hệ thống hạng I',
            ten: 'Quản trị viên hệ thống hạng I'
        },
        {
            id: 'V11.07.16',
            text: 'V11.07.16: Kiểm định viên công nghệ thông tin hạng I',
            ten: 'Kiểm định viên công nghệ thông tin hạng I'
        },
        {
            id: 'V11.08.19',
            text: 'V11.08.19: Phát triển phần mềm hạng I',
            ten: 'Phát triển phần mềm hạng I'
        },
        {
            id: 'V.04.02.04',
            text: 'V.04.02.04: Thẩm kế viên hạng I',
            ten: 'Thẩm kế viên hạng I'
        },
        {
            id: '02.012',
            text: '02.012: Lưu trữ viên cao cấp',
            ten: 'Lưu trữ viên cao cấp'
        },
        {
            id: '09.054',
            text: '09.054: Chẩn đoán viên cao cấp bệnh động vật',
            ten: 'Chẩn đoán viên cao cấp bệnh động vật'
        },
        {
            id: '09.058',
            text: '09.058: Dự báo viên cao cấp bảo vệ thực vật',
            ten: 'Dự báo viên cao cấp bảo vệ thực vật'
        },
        {
            id: '09.062',
            text: '09.062: Giám định viên cao cấp thuốc bảo vệ thực vật - thú y',
            ten: 'Giám định viên cao cấp thuốc bảo vệ thực vật - thú y'
        },
        {
            id: '09.070',
            text: '09.070: Kiểm nghiệm viên cao cấp giống cây trồng',
            ten: 'Kiểm nghiệm viên cao cấp giống cây trồng'
        },
        {
            id: 'V11.10.27',
            text: 'V11.10.27: Phát thanh viên cao cấp',
            ten: 'Phát thanh viên cao cấp'
        },
        {
            id: 'V11.12.35',
            text: 'V11.12.35: Quay phim viên cao cấp',
            ten: 'Quay phim viên cao cấp'
        },
        {
            id: '17.164',
            text: '17.164: Bảo tàng viên cao cấp',
            ten: 'Bảo tàng viên cao cấp'
        },
        {
            id: 'V.10.02.30',
            text: 'V.10.02.30: Thư viện viên cao cấp',
            ten: 'Thư viện viên cao cấp'
        },
        {
            id: '17.172',
            text: '17.172: Phương pháp viên cao cấp',
            ten: 'Phương pháp viên cao cấp'
        },
        {
            id: 'V11.09.23',
            text: 'V11.09.23: Âm thanh viên cao cấp',
            ten: 'Âm thanh viên cao cấp'
        },
        {
            id: '17.168',
            text: '17.168: Thư mục viên cao cấp',
            ten: 'Thư mục viên cao cấp'
        },
        {
            id: 'V.04.01.02',
            text: 'V.04.01.02: Kiến trúc sư chính',
            ten: 'Kiến trúc sư chính'
        },
        {
            id: 'V.05.01.02',
            text: 'V.05.01.02: Nghiên cứu viên chính',
            ten: 'Nghiên cứu viên chính'
        },
        {
            id: 'V.05.02.06',
            text: 'V.05.02.06: Kỹ sư chính',
            ten: 'Kỹ sư chính'
        },
        {
            id: '13.098',
            text: '13.098: Định chuẩn viên chính',
            ten: 'Định chuẩn viên chính'
        },
        {
            id: '13.101',
            text: '13.101: Giám định viên chính',
            ten: 'Giám định viên chính'
        },
        {
            id: 'V.06.03.07',
            text: 'V.06.03.07: Dự báo viên chính',
            ten: 'Dự báo viên chính'
        },
        {
            id: 'V.07.01.02',
            text: 'V.07.01.02: Phó giáo sư - giảng viên chính',
            ten: 'Phó giáo sư - giảng viên chính'
        },
        {
            id: 'V.08.01.02',
            text: 'V.08.01.02: Bác sĩ chính',
            ten: 'Bác sĩ chính'
        },
        {
            id: 'V.08.08.21',
            text: 'V.08.08.21: Dược sĩ chính',
            ten: 'Dược sĩ chính'
        },
        {
            id: '17.140',
            text: '17.140: Biên tập - Biên kịch - Biên dịch viên chính',
            ten: 'Biên tập - Biên kịch - Biên dịch viên chính'
        },
        {
            id: 'V.11.01.02',
            text: 'V.11.01.02: Biên tập viên - Biên kịch viên chính',
            ten: 'Biên tập viên - Biên kịch viên chính'
        },
        {
            id: 'V.11.03.08',
            text: 'V.11.03.08: Biên dịch viên chính',
            ten: 'Biên dịch viên chính'
        },
        {
            id: 'V.11.02.05',
            text: 'V.11.02.05: Phóng viên - Bình luận viên chính',
            ten: 'Phóng viên - Bình luận viên chính'
        },
        {
            id: '17.155',
            text: '17.155: Đạo diễn chính',
            ten: 'Đạo diễn chính'
        },
        {
            id: 'V.11.04.11',
            text: 'V.11.04.11: Đạo diễn truyền hình hạng II',
            ten: 'Đạo diễn truyền hình hạng II'
        },
        {
            id: 'V.10.03.09',
            text: 'V.10.03.09: Đạo diễn nghệ thuật hạng II',
            ten: 'Đạo diễn nghệ thuật hạng II'
        },
        {
            id: 'V.10.08.26',
            text: 'V.10.08.26: Họa sĩ chính',
            ten: 'Họa sĩ chính'
        },
        {
            id: 'V.10.01.02',
            text: 'V.10.01.02: Huấn luyện viên chính',
            ten: 'Huấn luyện viên chính'
        },
        {
            id: 'V.01.02.01',
            text: 'V.01.02.01: Lưu trữ viên chính',
            ten: 'Lưu trữ viên chính'
        },
        {
            id: 'V.03.04.10',
            text: 'V.03.04.10: Chẩn đoán viên chính bệnh động vật',
            ten: 'Chẩn đoán viên chính bệnh động vật'
        },
        {
            id: 'V.03.01.01',
            text: 'V.03.01.01: Dự báo viên chính bảo vệ thực vật',
            ten: 'Dự báo viên chính bảo vệ thực vật'
        },
        {
            id: 'V.03.02.04',
            text: 'V.03.02.04: Giám định viên chính thuốc bảo vệ thực vật - thú y',
            ten: 'Giám định viên chính thuốc bảo vệ thực vật - thú y'
        },
        {
            id: 'V.03.03.07',
            text: 'V.03.03.07: Kiểm nghiệm viên chính giống cây trồng',
            ten: 'Kiểm nghiệm viên chính giống cây trồng'
        },
        {
            id: '15.112',
            text: '15.112: GIáo viên trung học cao cấp',
            ten: 'GIáo viên trung học cao cấp'
        },
        {
            id: 'V.07.04.10',
            text: 'V.07.04.10: Giáo viên trung học cơ sở hạng I',
            ten: 'Giáo viên trung học cơ sở hạng I'
        },
        {
            id: 'V.07.04.30',
            text: 'V.07.04.30: Giáo viên trung học cơ sở hạng I',
            ten: 'Giáo viên trung học cơ sở hạng I'
        },
        {
            id: 'V.07.04.11',
            text: 'V.07.04.11: Giáo viên trung học cơ sở hạng II',
            ten: 'Giáo viên trung học cơ sở hạng II'
        },
        {
            id: 'V.07.05.13',
            text: 'V.07.05.13: Giáo viên trung học phổ thông hạng I',
            ten: 'Giáo viên trung học phổ thông hạng I'
        },
        {
            id: 'V.07.05.14',
            text: 'V.07.05.14: Giáo viên trung học phổ thông hạng II',
            ten: 'Giáo viên trung học phổ thông hạng II'
        },
        {
            id: 'V.07.02.04',
            text: 'V.07.02.04: Giáo viên mầm non hạng II',
            ten: 'Giáo viên mầm non hạng II'
        },
        {
            id: 'VC.A0',
            text: 'VC.A0: Giáo viên tiểu học hạng II',
            ten: 'Giáo viên tiểu học hạng II'
        },
        {
            id: 'V.05.01.04',
            text: 'V.05.01.04: Trợ lý nghiên cứu (hạng IV)',
            ten: 'Trợ lý nghiên cứu (hạng IV)'
        },
        {
            id: 'V.09.03.01',
            text: 'V.09.03.01: Kiểm định viên chính kỹ thuật an toàn lao động (hạng II)',
            ten: 'Kiểm định viên chính kỹ thuật an toàn lao động (hạng II)'
        },
        {
            id: 'V.09.04.01',
            text: 'V.09.04.01: Công tác xã hội viên chính (hạng II)',
            ten: 'Công tác xã hội viên chính (hạng II)'
        },
        {
            id: 'V.03.05.13',
            text: 'V.03.05.13: Kiểm tra viên vệ sinh thú y hạng II',
            ten: 'Kiểm tra viên vệ sinh thú y hạng II'
        },
        {
            id: 'V.03.06.16',
            text: 'V.03.06.16: Kiểm nghiệm viên thuốc thú y hạng II',
            ten: 'Kiểm nghiệm viên thuốc thú y hạng II'
        },
        {
            id: 'V.03.07.19',
            text: 'V.03.07.19: Kiểm nghiệm viên chăn nuôi hạng II',
            ten: 'Kiểm nghiệm viên chăn nuôi hạng II'
        },
        {
            id: 'V.03.08.22',
            text: 'V.03.08.22: Kiểm nghiệm viên thủy sản hạng II',
            ten: 'Kiểm nghiệm viên thủy sản hạng II'
        },
        {
            id: 'V.06.01.01',
            text: 'V.06.01.01: Địa chính viên hạng II',
            ten: 'Địa chính viên hạng II'
        },
        {
            id: 'V.06.02.04',
            text: 'V.06.02.04: Điều tra tài nguyên môi trường hạng II',
            ten: 'Điều tra tài nguyên môi trường hạng II'
        },
        {
            id: 'V.06.04.10',
            text: 'V.06.04.10: Kiểm soát viên khí tượng thủy văn hạng II',
            ten: 'Kiểm soát viên khí tượng thủy văn hạng II'
        },
        {
            id: 'V.06.06.16',
            text: 'V.06.06.16: Đo đạc bản đồ viên hạng II',
            ten: 'Đo đạc bản đồ viên hạng II'
        },
        {
            id: 'V.10.05.16',
            text: 'V.10.05.16: Di sản viên hạng II',
            ten: 'Di sản viên hạng II'
        },
        {
            id: 'V.10.04.13',
            text: 'V.10.04.13: Diễn viên hạng II',
            ten: 'Diễn viên hạng II'
        },
        {
            id: 'V.10.06.19',
            text: 'V.10.06.19: Phương pháp viên hạng II',
            ten: 'Phương pháp viên hạng II'
        },
        {
            id: 'V.10.07.22',
            text: 'V.10.07.22: Hướng dẫn viên văn hóa hạng II',
            ten: 'Hướng dẫn viên văn hóa hạng II'
        },
        {
            id: 'V.08.10.27',
            text: 'V.08.10.27: Dân số viên hạng II',
            ten: 'Dân số viên hạng II'
        },
        {
            id: 'V.08.05.11',
            text: 'V.08.05.11: Điều dưỡng hạng II',
            ten: 'Điều dưỡng hạng II'
        },
        {
            id: 'V.08.06.14',
            text: 'V.08.06.14: Hộ sinh hạng II',
            ten: 'Hộ sinh hạng II'
        },
        {
            id: 'V.08.07.17',
            text: 'V.08.07.17: Kỹ thuật y hạng II',
            ten: 'Kỹ thuật y hạng II'
        },
        {
            id: 'V.08.09.24',
            text: 'V.08.09.24: Dinh dưỡng hạng II',
            ten: 'Dinh dưỡng hạng II'
        },
        {
            id: 'V.08.04.09',
            text: 'V.08.04.09: Y tế công cộng chính (hạng II)',
            ten: 'Y tế công cộng chính (hạng II)'
        },
        {
            id: 'V11.05.10',
            text: 'V11.05.10: An toàn thông tin hạng II',
            ten: 'An toàn thông tin hạng II'
        },
        {
            id: 'V11.06.13',
            text: 'V11.06.13: Quản trị viên hệ thống hạng II',
            ten: 'Quản trị viên hệ thống hạng II'
        },
        {
            id: 'V11.07.17',
            text: 'V11.07.17: Kiểm định viên công nghệ thông tin hạng II',
            ten: 'Kiểm định viên công nghệ thông tin hạng II'
        },
        {
            id: 'V11.08.20',
            text: 'V11.08.20: Phát triển phần mềm hạng II',
            ten: 'Phát triển phần mềm hạng II'
        },
        {
            id: 'V02.01.01',
            text: 'V02.01.01: Trợ giúp viên pháp lý hạng II',
            ten: 'Trợ giúp viên pháp lý hạng II'
        },
        {
            id: 'V.04.02.05',
            text: 'V.04.02.05: Thẩm kế viên hạng II',
            ten: 'Thẩm kế viên hạng II'
        },
        {
            id: 'V11.10.28',
            text: 'V11.10.28: Phát thanh viên chính',
            ten: 'Phát thanh viên chính'
        },
        {
            id: 'V11.12.36',
            text: 'V11.12.36: Quay phim viên chính',
            ten: 'Quay phim viên chính'
        },
        {
            id: 'V11.11.32',
            text: 'V11.11.32: Dựng phim viên cao cấp',
            ten: 'Dựng phim viên cao cấp'
        },
        {
            id: '17.165',
            text: '17.165: Bảo tàng viên chính',
            ten: 'Bảo tàng viên chính'
        },
        {
            id: 'V.10.02.05',
            text: 'V.10.02.05: Thư viện viên hạng II',
            ten: 'Thư viện viên hạng II'
        },
        {
            id: 'V.10.06.19',
            text: 'V.10.06.19: Phương pháp viên chính',
            ten: 'Phương pháp viên chính'
        },
        {
            id: 'V11.09.24',
            text: 'V11.09.24: Âm thanh viên chính',
            ten: 'Âm thanh viên chính'
        },
        {
            id: '17a.195',
            text: '17a.195: Thư mục viên chính',
            ten: 'Thư mục viên chính'
        },
        {
            id: 'V.01.02.02',
            text: 'V.01.02.02: Lưu trữ viên',
            ten: 'Lưu trữ viên'
        },
        {
            id: 'V.03.04.11',
            text: 'V.03.04.11: Chẩn đoán viên bệnh động vật',
            ten: 'Chẩn đoán viên bệnh động vật'
        },
        {
            id: 'V.03.01.02',
            text: 'V.03.01.02: Dự báo viên bảo vệ thực vật',
            ten: 'Dự báo viên bảo vệ thực vật'
        },
        {
            id: 'V.03.02.05',
            text: 'V.03.02.05: Giám định viên thuốc bảo vệ thực vật - thú y',
            ten: 'Giám định viên thuốc bảo vệ thực vật - thú y'
        },
        {
            id: 'V.03.03.08',
            text: 'V.03.03.08: Kiểm nghiệm viên giống cây trồng',
            ten: 'Kiểm nghiệm viên giống cây trồng'
        },
        {
            id: 'V.04.01.03',
            text: 'V.04.01.03: Kiến trúc sư',
            ten: 'Kiến trúc sư'
        },
        {
            id: 'V.05.01.03',
            text: 'V.05.01.03: Nghiên cứu viên',
            ten: 'Nghiên cứu viên'
        },
        {
            id: 'V.05.02.07',
            text: 'V.05.02.07: Kỹ sư',
            ten: 'Kỹ sư'
        },
        {
            id: '13.099',
            text: '13.099: Định chuẩn viên',
            ten: 'Định chuẩn viên'
        },
        {
            id: '13.102',
            text: '13.102: Giám định viên',
            ten: 'Giám định viên'
        },
        {
            id: 'V.06.03.08',
            text: 'V.06.03.08: Dự báo viên',
            ten: 'Dự báo viên'
        },
        {
            id: 'V.06.05.13',
            text: 'V.06.05.13: Quan trắc viên chính',
            ten: 'Quan trắc viên chính'
        },
        {
            id: 'V.07.01.03',
            text: 'V.07.01.03: Giảng viên',
            ten: 'Giảng viên'
        },
        {
            id: '15.113',
            text: '15.113: Giáo viên trung học',
            ten: 'Giáo viên trung học'
        },
        {
            id: 'V.08.02.06',
            text: 'V.08.02.06: Bác sĩ',
            ten: 'Bác sĩ'
        },
        {
            id: '16.120',
            text: '16.120: Y tá cao cấp',
            ten: 'Y tá cao cấp'
        },
        {
            id: '16.123',
            text: '16.123: Nữ hộ sinh cao cấp',
            ten: 'Nữ hộ sinh cao cấp'
        },
        {
            id: '16.126',
            text: '16.126: Kỹ thuật viên cao cấp y',
            ten: 'Kỹ thuật viên cao cấp y'
        },
        {
            id: 'V.08.08.22',
            text: 'V.08.08.22: Dược sĩ',
            ten: 'Dược sĩ'
        },
        {
            id: '17.141',
            text: '17.141: Biên tập - Biên kịch - Biên dịch viên',
            ten: 'Biên tập - Biên kịch - Biên dịch viên'
        },
        {
            id: 'V.11.01.03',
            text: 'V.11.01.03: Biên tập viên- Biên kịch hạng III',
            ten: 'Biên tập viên- Biên kịch hạng III'
        },
        {
            id: 'V.11.03.09',
            text: 'V.11.03.09: Biên dịch viên hạng III',
            ten: 'Biên dịch viên hạng III'
        },
        {
            id: 'V.11.02.06',
            text: 'V.11.02.06: Phóng viên - Bình luận viên',
            ten: 'Phóng viên - Bình luận viên'
        },
        {
            id: 'V11.12.37',
            text: 'V11.12.37: Quay phim viên',
            ten: 'Quay phim viên'
        },
        {
            id: 'V11.11.33',
            text: 'V11.11.33: Dựng phim viên chính',
            ten: 'Dựng phim viên chính'
        },
        {
            id: '17.156',
            text: '17.156: Đạo diễn',
            ten: 'Đạo diễn'
        },
        {
            id: 'V.11.04.12',
            text: 'V.11.04.12: Đạo diễn truyền hình hạng III',
            ten: 'Đạo diễn truyền hình hạng III'
        },
        {
            id: 'V.10.03.10',
            text: 'V.10.03.10: Đạo diễn nghệ thuật hạng III',
            ten: 'Đạo diễn nghệ thuật hạng III'
        },
        {
            id: 'V.10.08.27',
            text: 'V.10.08.27: Họa sĩ',
            ten: 'Họa sĩ'
        },
        {
            id: '17.116',
            text: '17.116: Bảo tàng viên',
            ten: 'Bảo tàng viên'
        },
        {
            id: 'V.10.02.06',
            text: 'V.10.02.06: Thư viện viên hạng III',
            ten: 'Thư viện viên hạng III'
        },
        {
            id: 'V.10.06.20',
            text: 'V.10.06.20: Phương pháp viên',
            ten: 'Phương pháp viên'
        },
        {
            id: 'V.10.07.23',
            text: 'V.10.07.23: Hướng dẫn viên chính',
            ten: 'Hướng dẫn viên chính'
        },
        {
            id: '17.177',
            text: '17.177: Tuyên truyền viên chính',
            ten: 'Tuyên truyền viên chính'
        },
        {
            id: 'V.10.01.03',
            text: 'V.10.01.03: Huấn luyện viên',
            ten: 'Huấn luyện viên'
        },
        {
            id: 'V11.09.25',
            text: 'V11.09.25: Âm thanh viên',
            ten: 'Âm thanh viên'
        },
        {
            id: '17a.196',
            text: '17a.196: Thư mục viên',
            ten: 'Thư mục viên'
        },
        {
            id: 'V.07.04.12',
            text: 'V.07.04.12: Giáo viên trung học cơ sở hạng III',
            ten: 'Giáo viên trung học cơ sở hạng III'
        },
        {
            id: 'V.07.05.15',
            text: 'V.07.05.15: Giáo viên trung học phổ thông hạng III',
            ten: 'Giáo viên trung học phổ thông hạng III'
        },
        {
            id: 'V.07.02.05',
            text: 'V.07.02.05: Giáo viên mầm non hạng III',
            ten: 'Giáo viên mầm non hạng III'
        },
        {
            id: 'V.07.03.08',
            text: 'V.07.03.08: Giáo viên tiểu học hạng III',
            ten: 'Giáo viên tiểu học hạng III'
        },
        {
            id: 'V.09.03.02',
            text: 'V.09.03.02: Kiểm định viên kỹ thuật an toàn lao động (hạng III)',
            ten: 'Kiểm định viên kỹ thuật an toàn lao động (hạng III)'
        },
        {
            id: 'V.09.04.02',
            text: 'V.09.04.02: Công tác xã hội viên (hạng III)',
            ten: 'Công tác xã hội viên (hạng III)'
        },
        {
            id: 'V.03.05.14',
            text: 'V.03.05.14: Kiểm tra viên vệ sinh thú y hạng III',
            ten: 'Kiểm tra viên vệ sinh thú y hạng III'
        },
        {
            id: 'V.03.06.17',
            text: 'V.03.06.17: Kiểm nghiệm viên thuốc thú y hạng III',
            ten: 'Kiểm nghiệm viên thuốc thú y hạng III'
        },
        {
            id: 'V.03.07.20',
            text: 'V.03.07.20: Kiểm nghiệm viên chăn nuôi hạng III',
            ten: 'Kiểm nghiệm viên chăn nuôi hạng III'
        },
        {
            id: 'V.03.08.23',
            text: 'V.03.08.23: Kiểm nghiệm viên thủy sản hạng III',
            ten: 'Kiểm nghiệm viên thủy sản hạng III'
        },
        {
            id: 'V.06.01.02',
            text: 'V.06.01.02: Địa chính viên hạng III',
            ten: 'Địa chính viên hạng III'
        },
        {
            id: 'V.06.02.05',
            text: 'V.06.02.05: Điều tra tài nguyên môi trường hạng III',
            ten: 'Điều tra tài nguyên môi trường hạng III'
        },
        {
            id: 'V.06.04.11',
            text: 'V.06.04.11: Kiểm soát viên khí tượng thủy văn hạng III',
            ten: 'Kiểm soát viên khí tượng thủy văn hạng III'
        },
        {
            id: 'V.06.06.17',
            text: 'V.06.06.17: Đo đạc bản đồ viên hạng III',
            ten: 'Đo đạc bản đồ viên hạng III'
        },
        {
            id: 'V.10.05.17',
            text: 'V.10.05.17: Di sản viên hạng III',
            ten: 'Di sản viên hạng III'
        },
        {
            id: 'V.08.10.28',
            text: 'V.08.10.28: Dân số viên hạng III',
            ten: 'Dân số viên hạng III'
        },
        {
            id: 'V.08.05.12',
            text: 'V.08.05.12: Điều dưỡng hạng III',
            ten: 'Điều dưỡng hạng III'
        },
        {
            id: 'V.08.06.15',
            text: 'V.08.06.15: Hộ sinh hạng III',
            ten: 'Hộ sinh hạng III'
        },
        {
            id: 'V.08.07.18',
            text: 'V.08.07.18: Kỹ thuật y hạng III',
            ten: 'Kỹ thuật y hạng III'
        },
        {
            id: 'V.08.09.25',
            text: 'V.08.09.25: Dinh dưỡng hạng III',
            ten: 'Dinh dưỡng hạng III'
        },
        {
            id: 'V.08.01.03',
            text: 'V.08.01.03: Bác sĩ (hạng III)',
            ten: 'Bác sĩ (hạng III)'
        },
        {
            id: 'V.08.04.10',
            text: 'V.08.04.10: Y tế công cộng (hạng III)',
            ten: 'Y tế công cộng (hạng III)'
        },
        {
            id: 'V11.05.11',
            text: 'V11.05.11: An toàn thông tin hạng III',
            ten: 'An toàn thông tin hạng III'
        },
        {
            id: 'V11.06.14',
            text: 'V11.06.14: Quản trị viên hệ thống hạng III',
            ten: 'Quản trị viên hệ thống hạng III'
        },
        {
            id: 'V11.07.18',
            text: 'V11.07.18: Kiểm định viên công nghệ thông tin hạng III',
            ten: 'Kiểm định viên công nghệ thông tin hạng III'
        },
        {
            id: 'V11.08.21',
            text: 'V11.08.21: Phát triển phần mềm hạng III',
            ten: 'Phát triển phần mềm hạng III'
        },
        {
            id: 'V02.01.02',
            text: 'V02.01.02: Trợ giúp viên pháp lý hạng III',
            ten: 'Trợ giúp viên pháp lý hạng III'
        },
        {
            id: 'V.04.02.06',
            text: 'V.04.02.06: Thẩm kế viên hạng III',
            ten: 'Thẩm kế viên hạng III'
        },
        {
            id: 'V.07.04.32',
            text: 'V.07.04.32: Giáo viên trung học cơ sở hạng III',
            ten: 'Giáo viên trung học cơ sở hạng III'
        },
        {
            id: '17.147',
            text: '17.147: Phát thanh viên',
            ten: 'Phát thanh viên'
        },
        {
            id: 'V.01.02.03',
            text: 'V.01.02.03: Lưu trữ viên trung cấp',
            ten: 'Lưu trữ viên trung cấp'
        },
        {
            id: '02.016',
            text: '02.016: Kỹ thuật viên lưu trữ',
            ten: 'Kỹ thuật viên lưu trữ'
        },
        {
            id: 'V.03.04.12',
            text: 'V.03.04.12: Kỹ thuật viên chẩn đoán bệnh động vật',
            ten: 'Kỹ thuật viên chẩn đoán bệnh động vật'
        },
        {
            id: '09.061',
            text: '09.061: Kỹ thuật viên dự báo bảo vệ thực vật',
            ten: 'Kỹ thuật viên dự báo bảo vệ thực vật'
        },
        {
            id: '09.065',
            text: '09.065: Kỹ thuật viên giám định thuốc bảo vệ thực vật - thú y',
            ten: 'Kỹ thuật viên giám định thuốc bảo vệ thực vật - thú y'
        },
        {
            id: 'V.03.03.09',
            text: 'V.03.03.09: Kỹ thuật viên kiểm nghiệm viên giống cây trồng',
            ten: 'Kỹ thuật viên kiểm nghiệm viên giống cây trồng'
        },
        {
            id: 'V.05.02.08',
            text: 'V.05.02.08: Kỹ thuật viên',
            ten: 'Kỹ thuật viên'
        },
        {
            id: 'V.06.05.14',
            text: 'V.06.05.14: Quan trắc viên',
            ten: 'Quan trắc viên'
        },
        {
            id: '15.114',
            text: '15.114: Giáo viên tiểu học',
            ten: 'Giáo viên tiểu học'
        },
        {
            id: '15.115',
            text: '15.115: Giáo viên mầm non',
            ten: 'Giáo viên mầm non'
        },
        {
            id: 'V.08.03.07',
            text: 'V.08.03.07: Y sĩ',
            ten: 'Y sĩ'
        },
        {
            id: '16.121',
            text: '16.121: Y tá chính',
            ten: 'Y tá chính'
        },
        {
            id: '16.124',
            text: '16.124: Nữ hộ sinh chính',
            ten: 'Nữ hộ sinh chính'
        },
        {
            id: '16.127',
            text: '16.127: Kỹ thuật viên chính y',
            ten: 'Kỹ thuật viên chính y'
        },
        {
            id: '16.135',
            text: '16.135: Dược sĩ trung cấp',
            ten: 'Dược sĩ trung cấp'
        },
        {
            id: '16.137',
            text: '16.137: Kỹ thuật viên chính dược',
            ten: 'Kỹ thuật viên chính dược'
        },
        {
            id: 'V11.11.34',
            text: 'V11.11.34: Dựng phim viên',
            ten: 'Dựng phim viên'
        },
        {
            id: 'V.10.04.14',
            text: 'V.10.04.14: Diễn viên hạng III',
            ten: 'Diễn viên hạng III'
        },
        {
            id: 'V.10.08.28',
            text: 'V.10.08.28: Họa sỹ trung cấp',
            ten: 'Họa sỹ trung cấp'
        },
        {
            id: '17.167',
            text: '17.167: Kỹ thuật viên bảo tồn, bảo tàng',
            ten: 'Kỹ thuật viên bảo tồn, bảo tàng'
        },
        {
            id: 'V.10.02.07',
            text: 'V.10.02.07: Thư viện viên hạng IV',
            ten: 'Thư viện viên hạng IV'
        },
        {
            id: 'V.10.07.24',
            text: 'V.10.07.24: Hướng dẫn viên (ngành văn hóa - thông tin)',
            ten: 'Hướng dẫn viên (ngành văn hóa - thông tin)'
        },
        {
            id: '17.178',
            text: '17.178: Tuyên truyền viên',
            ten: 'Tuyên truyền viên'
        },
        {
            id: 'V.10.01.04',
            text: 'V.10.01.04: Hướng dẫn viên (ngành thể dục thể thao)',
            ten: 'Hướng dẫn viên (ngành thể dục thể thao)'
        },
        {
            id: 'V.07.02.06',
            text: 'V.07.02.06: Giáo viên mầm non hạng IV',
            ten: 'Giáo viên mầm non hạng IV'
        },
        {
            id: 'V.07.03.09',
            text: 'V.07.03.09: Giáo viên tiểu học hạng IV',
            ten: 'Giáo viên tiểu học hạng IV'
        },
        {
            id: 'V.09.03.03',
            text: 'V.09.03.03: Kỹ thuật viên kiểm định kỹ thuật an toàn lao động (hạng IV)',
            ten: 'Kỹ thuật viên kiểm định kỹ thuật an toàn lao động (hạng IV)'
        },
        {
            id: 'V.09.04.03',
            text: 'V.09.04.03: Nhân viên công tác xã hội (hạng IV)',
            ten: 'Nhân viên công tác xã hội (hạng IV)'
        },
        {
            id: 'V.03.01.03',
            text: 'V.03.01.03: Kỹ thuật viên bảo vệ thực vật hạng IV',
            ten: 'Kỹ thuật viên bảo vệ thực vật hạng IV'
        },
        {
            id: 'V.03.02.06',
            text: 'V.03.02.06: Kỹ thuật viên giám định thuốc bảo vệ thực vật hạng IV',
            ten: 'Kỹ thuật viên giám định thuốc bảo vệ thực vật hạng IV'
        },
        {
            id: 'V.03.05.15',
            text: 'V.03.05.15: Kỹ thuật viên kiểm tra vệ sinh thú y hạng IV',
            ten: 'Kỹ thuật viên kiểm tra vệ sinh thú y hạng IV'
        },
        {
            id: 'V.03.06.18',
            text: 'V.03.06.18: Kỹ thuật viên kiểm nghiệm thuốc thú y hạng IV',
            ten: 'Kỹ thuật viên kiểm nghiệm thuốc thú y hạng IV'
        },
        {
            id: 'V.03.07.21',
            text: 'V.03.07.21: Kỹ thuật viên kiểm nghiệm chăn nuôi hạng IV',
            ten: 'Kỹ thuật viên kiểm nghiệm chăn nuôi hạng IV'
        },
        {
            id: 'V.03.08.24',
            text: 'V.03.08.24: Kỹ thuật viên kiểm nghiệm thủy sản hạng IV',
            ten: 'Kỹ thuật viên kiểm nghiệm thủy sản hạng IV'
        },
        {
            id: 'V.06.01.03',
            text: 'V.06.01.03: Địa chính viên hạng IV',
            ten: 'Địa chính viên hạng IV'
        },
        {
            id: 'V.06.02.06',
            text: 'V.06.02.06: Điều tra tài nguyên môi trường hạng IV',
            ten: 'Điều tra tài nguyên môi trường hạng IV'
        },
        {
            id: 'V.06.03.09',
            text: 'V.06.03.09: Dự báo viên khí tượng thủy văn hạng IV',
            ten: 'Dự báo viên khí tượng thủy văn hạng IV'
        },
        {
            id: 'V.06.04.12',
            text: 'V.06.04.12: Kiểm soát viên khí tượng thủy văn hạng IV',
            ten: 'Kiểm soát viên khí tượng thủy văn hạng IV'
        },
        {
            id: 'V.06.05.15',
            text: 'V.06.05.15: Quan trắc viên tài nguyên môi trường hạng IV',
            ten: 'Quan trắc viên tài nguyên môi trường hạng IV'
        },
        {
            id: 'V.06.06.18',
            text: 'V.06.06.18: Đo đạc bản đồ viên hạng IV',
            ten: 'Đo đạc bản đồ viên hạng IV'
        },
        {
            id: 'V.10.05.18',
            text: 'V.10.05.18: Di sản viên hạng IV',
            ten: 'Di sản viên hạng IV'
        },
        {
            id: 'V.10.03.11',
            text: 'V.10.03.11: Đạo diễn nghệ thuật hạng IV',
            ten: 'Đạo diễn nghệ thuật hạng IV'
        },
        {
            id: 'V.10.04.15',
            text: 'V.10.04.15: Diễn viên hạng IV',
            ten: 'Diễn viên hạng IV'
        },
        {
            id: 'V.10.06.21',
            text: 'V.10.06.21: Phương pháp viên hạng IV',
            ten: 'Phương pháp viên hạng IV'
        },
        {
            id: 'V.08.10.29',
            text: 'V.08.10.29: Dân số viên hạng IV',
            ten: 'Dân số viên hạng IV'
        },
        {
            id: 'V.08.05.13',
            text: 'V.08.05.13: Điều dưỡng hạng IV',
            ten: 'Điều dưỡng hạng IV'
        },
        {
            id: 'V.08.06.16',
            text: 'V.08.06.16: Hộ sinh hạng IV',
            ten: 'Hộ sinh hạng IV'
        },
        {
            id: 'V.08.07.19',
            text: 'V.08.07.19: Kỹ thuật y hạng IV',
            ten: 'Kỹ thuật y hạng IV'
        },
        {
            id: 'V.08.09.26',
            text: 'V.08.09.26: Dinh dưỡng hạng IV',
            ten: 'Dinh dưỡng hạng IV'
        },
        {
            id: 'V.08.08.23',
            text: 'V.08.08.23: Dược hạng IV',
            ten: 'Dược hạng IV'
        },
        {
            id: 'V11.06.15',
            text: 'V11.06.15: Quản trị viên hệ thống hạng IV',
            ten: 'Quản trị viên hệ thống hạng IV'
        },
        {
            id: 'V11.08.22',
            text: 'V11.08.22: Phát triển phần mềm hạng IV',
            ten: 'Phát triển phần mềm hạng IV'
        },
        {
            id: 'V.04.02.07',
            text: 'V.04.02.07: Thẩm kế viên hạng IV',
            ten: 'Thẩm kế viên hạng IV'
        },
        {
            id: '14.108',
            text: '14.108: Quan trắc viên sơ cấp',
            ten: 'Quan trắc viên sơ cấp'
        },
        {
            id: '16.122',
            text: '16.122: Y tá',
            ten: 'Y tá'
        },
        {
            id: '16.125',
            text: '16.125: Nữ hộ sinh',
            ten: 'Nữ hộ sinh'
        },
        {
            id: '16.128',
            text: '16.128: Kỹ thuật viên y',
            ten: 'Kỹ thuật viên y'
        },
        {
            id: '16.130',
            text: '16.130: Hộ lý',
            ten: 'Hộ lý'
        },
        {
            id: '16.136',
            text: '16.136: Dược tá',
            ten: 'Dược tá'
        },
        {
            id: '16.138',
            text: '16.138: Kỹ thuật viên dược',
            ten: 'Kỹ thuật viên dược'
        },
        {
            id: '16.131',
            text: '16.131: Ngạch nhân viên nhà xác',
            ten: 'Ngạch nhân viên nhà xác'
        },
        {
            id: '16.129',
            text: '16.129: Ngạch y công',
            ten: 'Ngạch y công'
        },
        {
            id: '01.006',
            text: '01.006: Nhân viên đánh máy',
            ten: 'Nhân viên đánh máy'
        },
        {
            id: '01.007',
            text: '01.007: Nhân viên kỹ thuật',
            ten: 'Nhân viên kỹ thuật'
        },
        {
            id: '01.008',
            text: '01.008: Nhân viên văn thư',
            ten: 'Nhân viên văn thư'
        },
        {
            id: '01.009',
            text: '01.009: Nhân viên Phục vụ',
            ten: 'Nhân viên Phục vụ'
        },
        {
            id: '01.010',
            text: '01.010: Lái xe cơ quan',
            ten: 'Lái xe cơ quan'
        },
        {
            id: '01.011',
            text: '01.011: Nhân viên bảo vệ',
            ten: 'Nhân viên bảo vệ'
        },
        {
            id: '14.250',
            text: '14.250: Dự báo viên trung cấp khí tượng thuỷ văn',
            ten: 'Dự báo viên trung cấp khí tượng thuỷ văn'
        },
        {
            id: '14.253',
            text: '14.253: Kiểm soát viên khí tượng thuỷ văn',
            ten: 'Kiểm soát viên khí tượng thuỷ văn'
        },
        {
            id: '14.256',
            text: '14.256: Quan trắc viên chính tài nguyên môi trường',
            ten: 'Quan trắc viên chính tài nguyên môi trường'
        },
        {
            id: '14.257',
            text: '14.257: Quan trắc viên tài nguyên môi trường',
            ten: 'Quan trắc viên tài nguyên môi trường'
        },
        {
            id: '17c.214',
            text: '17c.214: Phát thanh viên chưa đạt chuẩn (chưa đạt trình độ cao đẳng) ',
            ten: 'Phát thanh viên chưa đạt chuẩn (chưa đạt trình độ cao đẳng) '
        },
        {
            id: '19.223',
            text: '19.223: Thủ kho bảo quản',
            ten: 'Thủ kho bảo quản'
        },
        {
            id: 'V.03.09.26',
            text: 'V.03.09.26: Khuyến nông viên (hạng III)',
            ten: 'Khuyến nông viên (hạng III)'
        },
        {
            id: 'V.03.09.27',
            text: 'V.03.09.27: Kỹ thuật viên khuyến nông (hạng IV)',
            ten: 'Kỹ thuật viên khuyến nông (hạng IV)'
        },
        {
            id: 'V.03.10.29',
            text: 'V.03.10.29: Quản lý bảo vệ rừng viên (hạng III)',
            ten: 'Quản lý bảo vệ rừng viên (hạng III)'
        },
        {
            id: 'V.03.10.30',
            text: 'V.03.10.30: Kỹ thuật viên quản lý bảo vệ rừng (hạng IV)',
            ten: 'Kỹ thuật viên quản lý bảo vệ rừng (hạng IV)'
        },
        {
            id: 'V.09.02.02',
            text: 'V.09.02.02: Giảng viên GDNN chính (hạng II)',
            ten: 'Giảng viên GDNN chính (hạng II)'
        },
        {
            id: 'V.09.02.03',
            text: 'V.09.02.03: Giảng viên GDNN lý thuyết (hạng III)',
            ten: 'Giảng viên GDNN lý thuyết (hạng III)'
        },
        {
            id: 'V.09.02.07',
            text: 'V.09.02.07: Giáo viên GDNN lý thuyết hạng III',
            ten: 'Giáo viên GDNN lý thuyết hạng III'
        },
        {
            id: 'V.09.02.08',
            text: 'V.09.02.08: Giáo viên GDNN thực hành hạng III',
            ten: 'Giáo viên GDNN thực hành hạng III'
        },
        {
            id: 'V.09.02.09',
            text: 'V.09.02.09: Giáo viên GDNN hạng IV',
            ten: 'Giáo viên GDNN hạng IV'
        },
        {
            id: 'V11.10.30',
            text: 'V11.10.30: Phát thanh viên hạng IV',
            ten: 'Phát thanh viên hạng IV'
        },
        {
            id: 'V.11.06.12',
            text: 'V.11.06.12: Công nghệ thông tin (hạng I) - V.11.06.12',
            ten: 'Công nghệ thông tin (hạng I) - V.11.06.12'
        },
        {
            id: '04.024a',
            text: '04.024a: Kiểm tra viên chính - 04.024a',
            ten: 'Kiểm tra viên chính - 04.024a'
        },
        {
            id: 'V.09.02.05',
            text: 'V.09.02.05: Giáo viên GDNN hạng I - V.09.02.05',
            ten: 'Giáo viên GDNN hạng I - V.09.02.05'
        },
        {
            id: 'V.09.02.01',
            text: 'V.09.02.01: Giảng viên giáo dục nghề nghiệp cao cấp',
            ten: 'Giảng viên giáo dục nghề nghiệp cao cấp'
        },
        {
            id: '04.023A',
            text: '04.023A: Kiểm tra viên cao cấp',
            ten: 'Kiểm tra viên cao cấp'
        },
        {
            id: 'V.07.07.21',
            text: 'V.07.07.21: Nhân viên giáo vụ - V.07.07.21',
            ten: 'Nhân viên giáo vụ - V.07.07.21'
        },
        {
            id: 'V11.12.38',
            text: 'V11.12.38: Quay phim (hạng IV) - V11.12.38',
            ten: 'Quay phim (hạng IV) - V11.12.38'
        },
        {
            id: 'V.11.05.12',
            text: 'V.11.05.12: An toàn thông tin (hạng IV) - V.11.05.12',
            ten: 'An toàn thông tin (hạng IV) - V.11.05.12'
        },
        {
            id: 'V.11.06.15',
            text: 'V.11.06.15: Công nghệ thông tin (hạng IV) - V.11.06.15',
            ten: 'Công nghệ thông tin (hạng IV) - V.11.06.15'
        },
        {
            id: 'V.07.07.20',
            text: 'V.07.07.20: Nhân viên thiết bị, thí nghiệm - V.07.07.20',
            ten: 'Nhân viên thiết bị, thí nghiệm - V.07.07.20'
        },
        {
            id: 'V.11.06.14',
            text: 'V.11.06.14: Công nghệ thông tin (hạng III) - V.11.06.14',
            ten: 'Công nghệ thông tin (hạng III) - V.11.06.14'
        },
        {
            id: 'V.02.01.02',
            text: 'V.02.01.02: Trợ giúp viên pháp lý hạng III - V.02.01.02',
            ten: 'Trợ giúp viên pháp lý hạng III - V.02.01.02'
        },
        {
            id: 'V.07.06.16',
            text: 'V.07.06.16: Nhân viên hỗ trợ giáo dục người khuyết tật (hạng IV) - V.07.06.16',
            ten: 'Nhân viên hỗ trợ giáo dục người khuyết tật (hạng IV) - V.07.06.16'
        },
        {
            id: 'V.09.02.04',
            text: 'V.09.02.04: Giảng viên giáo dục nghề nghiệp thực hành (hạng III)',
            ten: 'Giảng viên giáo dục nghề nghiệp thực hành (hạng III)'
        },
        {
            id: 'V.09.02.06',
            text: 'V.09.02.06: Giáo viên GDNN hạng II - V.09.02.06',
            ten: 'Giáo viên GDNN hạng II - V.09.02.06'
        },
        {
            id: '17a.211',
            text: '17a.211: Phát thanh viên (trình độ cao đẳng)',
            ten: 'Phát thanh viên (trình độ cao đẳng)'
        },
        {
            id: '16a.200',
            text: '16a.200: Điều dưỡng (cao đẳng)',
            ten: 'Điều dưỡng (cao đẳng)'
        },
        {
            id: '17a.213',
            text: '17a.213: Phương pháp viên (trình độ cao đẳng)',
            ten: 'Phương pháp viên (trình độ cao đẳng)'
        },
        {
            id: '17a.212',
            text: '17a.212: Quay phim viên (cao đẳng)',
            ten: 'Quay phim viên (cao đẳng)'
        },
        {
            id: '17.159',
            text: '17.159: Diễn viên (cao đẳng)',
            ten: 'Diễn viên (cao đẳng)'
        },
        {
            id: '02a.014',
            text: '02a.014: Lưu trữ viên (cao đẳng)',
            ten: 'Lưu trữ viên (cao đẳng)'
        },
        {
            id: '16b.121',
            text: '16b.121: Điều dưỡng trung cấp (CŨ)',
            ten: 'Điều dưỡng trung cấp (CŨ)'
        },
        {
            id: '16.295',
            text: '16.295: Hộ sinh (CŨ)',
            ten: 'Hộ sinh (CŨ)'
        },
        {
            id: '16a.199',
            text: '16a.199: Điều dưỡng chính (CŨ)',
            ten: 'Điều dưỡng chính (CŨ)'
        },
        {
            id: '16.297',
            text: '16.297: Hộ sinh trung cấp (CŨ)',
            ten: 'Hộ sinh trung cấp (CŨ)'
        },
        {
            id: '16.286',
            text: '16.286: Kỹ thuật viên cao đẳng y ',
            ten: 'Kỹ thuật viên cao đẳng y '
        },
        {
            id: '16.296',
            text: '16.296: Hộ sinh cao đẳng',
            ten: 'Hộ sinh cao đẳng'
        },
        {
            id: '16.294',
            text: '16.294: Hộ sinh chính (CŨ)',
            ten: 'Hộ sinh chính (CŨ)'
        },
        {
            id: 'V.07.03.27',
            text: 'V.07.03.27: Giáo viên tiểu học hạng I - V.07.03.27',
            ten: 'Giáo viên tiểu học hạng I - V.07.03.27'
        },
        {
            id: '15a.206',
            text: '15a.206: Giáo viên mầm non chính (trình độ cao đẳng) ',
            ten: 'Giáo viên mầm non chính (trình độ cao đẳng) '
        },
        {
            id: '15a.205',
            text: '15a.205: Giáo viên mầm non cao cấp (trình độ đại học) ',
            ten: 'Giáo viên mầm non cao cấp (trình độ đại học) '
        },
        {
            id: '15a.204',
            text: '15a.204: Giáo viên tiểu học chính (trình độ cao đẳng) ',
            ten: 'Giáo viên tiểu học chính (trình độ cao đẳng) '
        },
        {
            id: '15a.203',
            text: '15a.203: Giáo viên tiểu học cao cấp (trình độ đại học) ',
            ten: 'Giáo viên tiểu học cao cấp (trình độ đại học) '
        },
        {
            id: '15a.202',
            text: '15a.202: Giáo viên trung học cơ sở (trình độ cao đẳng) ',
            ten: 'Giáo viên trung học cơ sở (trình độ cao đẳng) '
        },
        {
            id: '15a.201',
            text: '15a.201: Giáo viên trung học cơ sở chính (trình độ đại học)',
            ten: 'Giáo viên trung học cơ sở chính (trình độ đại học)'
        },
        {
            id: '15c.207',
            text: '15c.207: Giáo viên trung học phổ thông chưa đạt chuẩn (chưa đạt trình độ đại học)',
            ten: 'Giáo viên trung học phổ thông chưa đạt chuẩn (chưa đạt trình độ đại học)'
        },
        {
            id: '15c.208',
            text: '15c.208: Giáo viên trung học cơ sở chưa đạt chuẩn (chưa đạt trình độ cao đẳng)',
            ten: 'Giáo viên trung học cơ sở chưa đạt chuẩn (chưa đạt trình độ cao đẳng)'
        },
        {
            id: '15c.209',
            text: '15c.209: Giáo viên tiểu học chưa đạt chuẩn (chưa đạt trình độ trung học)',
            ten: 'Giáo viên tiểu học chưa đạt chuẩn (chưa đạt trình độ trung học)'
        },
        {
            id: '15c.210',
            text: '15c.210: Giáo viên mầm non chưa đạt chuẩn (chưa đạt trình độ trung học)',
            ten: 'Giáo viên mầm non chưa đạt chuẩn (chưa đạt trình độ trung học)'
        },
        {
            id: '13.096',
            text: '13.096: Kỹ Thuật Viên',
            ten: 'Kỹ Thuật Viên'
        },
        {
            id: '15.111',
            text: '15.111: Giảng viên',
            ten: 'Giảng viên'
        },
        {
            id: '09.060',
            text: '09.060: Dự báo viên bảo vệ thực vật ',
            ten: 'Dự báo viên bảo vệ thực vật '
        },
        {
            id: '17.175',
            text: '17.175: Hướng dẫn viên chính ',
            ten: 'Hướng dẫn viên chính '
        },
        {
            id: '17.144',
            text: '17.144: Phóng viên - Bình luận viên',
            ten: 'Phóng viên - Bình luận viên'
        },
        {
            id: '17.143',
            text: '17.143: Phóng viên - Bình luận viên chính',
            ten: 'Phóng viên - Bình luận viên chính'
        },
        {
            id: 'V.07.08.21',
            text: 'V.07.08.21: Giảng viên cao đẳng sư phạm chính (hạng II) ',
            ten: 'Giảng viên cao đẳng sư phạm chính (hạng II) '
        },
        {
            id: 'V.07.08.22',
            text: 'V.07.08.22: Giảng viên cao đẳng sư phạm (hạng III) ',
            ten: 'Giảng viên cao đẳng sư phạm (hạng III) '
        },
        {
            id: '17.173',
            text: '17.173: Phương pháp viên chính',
            ten: 'Phương pháp viên chính'
        },
        {
            id: 'V.07.02.24',
            text: 'V.07.02.24: Giáo viên mầm non hạng I',
            ten: 'Giáo viên mầm non hạng I'
        },
        {
            id: 'V.07.04.31',
            text: 'V.07.04.31: Giáo viên trung học cơ sở hạng II',
            ten: 'Giáo viên trung học cơ sở hạng II'
        },
        {
            id: 'V.07.02.25',
            text: 'V.07.02.25: Giáo viên mầm non hạng II',
            ten: 'Giáo viên mầm non hạng II'
        },
        {
            id: 'V.07.02.26',
            text: 'V.07.02.26: Giáo viên mầm non hạng III',
            ten: 'Giáo viên mầm non hạng III'
        },
        {
            id: 'V.07.03.28',
            text: 'V.07.03.28: Giáo viên tiểu học hạng II',
            ten: 'Giáo viên tiểu học hạng II'
        },
        {
            id: 'V.07.03.29',
            text: 'V.07.03.29: Giáo viên tiểu học hạng III',
            ten: 'Giáo viên tiểu học hạng III'
        },
        {
            id: '17.171',
            text: '17.171: Thư viện viên trung cấp',
            ten: 'Thư viện viên trung cấp'
        },
        {
            id: '16.119',
            text: '16.119: Ysĩ',
            ten: 'Ysĩ'
        },
        {
            id: '17.170',
            text: '17.170: Thư viện viên',
            ten: 'Thư viện viên'
        },
        {
            id: '16.118',
            text: '16.118: Bác sĩ',
            ten: 'Bác sĩ'
        },
        {
            id: '09.056',
            text: '09.056: Chuẩn đoán viên bệnh động vật',
            ten: 'Chuẩn đoán viên bệnh động vật'
        },
        {
            id: 'V.02.01.00',
            text: 'V.02.01.00: Trợ giúp viên pháp lý hạng I',
            ten: 'Trợ giúp viên pháp lý hạng I'
        },
        {
            id: '13.095',
            text: '13.095: Kỹ sư',
            ten: 'Kỹ sư'
        },
        {
            id: '10.078',
            text: '10.078: Kiểm lâm viên chính',
            ten: 'Kiểm lâm viên chính'
        },
        {
            id: '10.079',
            text: '10.079: Kiểm lâm viên',
            ten: 'Kiểm lâm viên'
        },
        {
            id: '10.080',
            text: '10.080: Kiểm lâm viên sơ cấp',
            ten: 'Kiểm lâm viên sơ cấp'
        },
        {
            id: '09.072',
            text: '09.072: Kiểm nghiệm viên giống cây trồng',
            ten: 'Kiểm nghiệm viên giống cây trồng'
        },
        {
            id: '09.073',
            text: '09.073: Kỹ thuật viên kiểm nghiệm viên giống cây trồng',
            ten: 'Kỹ thuật viên kiểm nghiệm viên giống cây trồng'
        },
        {
            id: '02.015',
            text: '02.015: Lưu trữ viên trung cấp',
            ten: 'Lưu trữ viên trung cấp'
        },
        {
            id: 'CT01',
            text: 'CT01: Bí thư đảng ủy',
            ten: 'Bí thư đảng ủy'
        },
        {
            id: 'CT02',
            text: 'CT02: Phó Bí thư đảng ủy',
            ten: 'Phó Bí thư đảng ủy'
        },
        {
            id: 'CT03',
            text: 'CT03: Chủ tịch Hội đồng nhân dân',
            ten: 'Chủ tịch Hội đồng nhân dân'
        },
        {
            id: 'CT04',
            text: 'CT04: Chủ tịch Ủy ban nhân dân',
            ten: 'Chủ tịch Ủy ban nhân dân'
        },
        {
            id: 'CT05',
            text: 'CT05: Thường trực Đảng ủy',
            ten: 'Thường trực Đảng ủy'
        },
        {
            id: 'CT06',
            text: 'CT06: Chủ tịch Ủy ban Mặt trận tổ quốc Việt Nam',
            ten: 'Chủ tịch Ủy ban Mặt trận tổ quốc Việt Nam'
        },
        {
            id: 'CT07',
            text: 'CT07: Phó Chủ tịch Hội đồng nhân dân',
            ten: 'Phó Chủ tịch Hội đồng nhân dân'
        },
        {
            id: 'CT08',
            text: 'CT08: Phó Chủ tịch Ủy ban nhân dân',
            ten: 'Phó Chủ tịch Ủy ban nhân dân'
        },
        {
            id: 'CT09',
            text: 'CT09: Trưởng các đoàn thể',
            ten: 'Trưởng các đoàn thể'
        },
        {
            id: 'CT10',
            text: 'CT10: Ủy viên Ủy ban nhân dân',
            ten: 'Ủy viên Ủy ban nhân dân'
        },
        {
            id: 'V.11.06.13',
            text: 'V.11.06.13: Công nghệ thông tin hạng II',
            ten: 'Công nghệ thông tin hạng II'
        },
        {
            id: '09.055',
            text: '09.055: Chẩn đoán viên chính bệnh động vật',
            ten: 'Chẩn đoán viên chính bệnh động vật'
        },
        {
            id: '14.105',
            text: '14.105: Dự báo viên',
            ten: 'Dự báo viên'
        },
        {
            id: '14.104',
            text: '14.104: Dự báo viên chính',
            ten: 'Dự báo viên chính'
        },
        {
            id: '09.059',
            text: '09.059: Dự báo viên chính bảo vệ thực vật',
            ten: 'Dự báo viên chính bảo vệ thực vật'
        },
        {
            id: '17.152',
            text: '17.152: Dựng phim viên chính',
            ten: 'Dựng phim viên chính'
        },
        {
            id: '09.063',
            text: '09.063: Giám định viên chính thuốc bảo vệ thực vật - thú y',
            ten: 'Giám định viên chính thuốc bảo vệ thực vật - thú y'
        },
        {
            id: '15.109',
            text: '15.109: Giáo sư - giảng viên cao cấp',
            ten: 'Giáo sư - giảng viên cao cấp'
        },
        {
            id: '09.071',
            text: '09.071: Kiểm nghiệm viên chính giống cây trồng ',
            ten: 'Kiểm nghiệm viên chính giống cây trồng '
        },
        {
            id: '09.057',
            text: '09.057: Kỹ thuật viên chẩn đoán bệnh động vật ',
            ten: 'Kỹ thuật viên chẩn đoán bệnh động vật '
        },
        {
            id: '15.110',
            text: '15.110: Phó giáo sư - giảng viên chính',
            ten: 'Phó giáo sư - giảng viên chính'
        },
        {
            id: '17.142',
            text: '17.142: Phóng viên - Bình luận viên cao cấp ',
            ten: 'Phóng viên - Bình luận viên cao cấp '
        },
        {
            id: '14.106',
            text: '14.106: Quan trắc viên chính',
            ten: 'Quan trắc viên chính'
        },
        {
            id: '01a.003',
            text: '01a.003: Chuyên viên trình độ cao đẳng ',
            ten: 'Chuyên viên trình độ cao đẳng '
        },
        {
            id: '16b.122',
            text: '16b.122: Điều dưỡng sơ cấp',
            ten: 'Điều dưỡng sơ cấp'
        },
        {
            id: '13a.095',
            text: '13a.095: Kỹ sư cao đẳng',
            ten: 'Kỹ sư cao đẳng'
        },
        {
            id: '16b.120',
            text: '16b.120: Cử nhân điều dưỡng',
            ten: 'Cử nhân điều dưỡng'
        },
        {
            id: 'V11.10.29',
            text: 'V11.10.29: Phát thanh viên hạng III',
            ten: 'Phát thanh viên hạng III'
        },
        {
            id: '17a.170',
            text: '17a.170: Thư viện viên cao đẳng',
            ten: 'Thư viện viên cao đẳng'
        }
    ];

    const SelectAdapter_CoSoDaoTao = [
        {
            id: 'CĐ.I.151.0',
            text: 'Trường Cao Đẳng Cơ Khí Luyện Kim'
        },
        {
            id: 'CĐ.I.152.0',
            text: 'Trường Cao Đẳng Cộng Đồng Bắc Kạn'
        },
        {
            id: 'CĐ.I.153.0',
            text: 'Trường Cao Đẳng Cộng Đồng Lai Châu'
        },
        {
            id: 'CĐ.I.154.0',
            text: 'Trường Cao Đẳng Cộng Đồng Lào Cai'
        },
        {
            id: 'CĐ.I.155.0',
            text: 'Trường Cao Đẳng Công Nghệ Và Kinh Tế Công Nghiệp'
        },
        {
            id: 'CĐ.I.156.0',
            text: 'Trường Cao Đẳng Công Nghiệp Cẩm Phả'
        },
        {
            id: 'CĐ.I.158.0',
            text: 'Trường Cao Đẳng Công Nghiệp Thái Nguyên'
        },
        {
            id: 'CĐ.I.159.0',
            text: 'Trường Cao Đẳng Công Nghiệp Thực Phẩm'
        },
        {
            id: 'CĐ.I.160.0',
            text: 'Trường Cao Đẳng Công Nghiệp Và Xây Dựng'
        },
        {
            id: 'CĐ.I.161.0',
            text: 'Trường Cao Đẳng Công Nghiệp Việt Đức'
        },
        {
            id: 'CĐ.I.162.0',
            text: 'Trường Cao Đẳng Kinh Tế - Tài Chính Thái Nguyên'
        },
        {
            id: 'CĐ.I.163.0',
            text: 'Trường Cao Đẳng Kinh Tế Kỹ Thuật Điện Biên'
        },
        {
            id: 'CĐ.I.164.0',
            text: 'Trường Cao Đẳng Kinh Tế Kỹ Thuật Phú Thọ'
        },
        {
            id: 'CĐ.I.165.0',
            text: 'Trường Cao Đẳng Kỹ Thuật Công Nghiệp'
        },
        {
            id: 'CĐ.I.167.0',
            text: 'Trường Cao Đẳng Nông Lâm Đông Bắc'
        },
        {
            id: 'CĐ.I.168.0',
            text: 'Trường Cao Đẳng Sơn La'
        },
        {
            id: 'CĐ.I.169.0',
            text: 'Trường Cao Đẳng Sư Phạm Cao Bằng'
        },
        {
            id: 'CĐ.I.170.0',
            text: 'Trường Cao Đẳng Sư Phạm Điện Biên'
        },
        {
            id: 'CĐ.I.171.0',
            text: 'Trường Cao Đẳng Sư Phạm Hà Giang'
        },
        {
            id: 'CĐ.I.172.0',
            text: 'Trường Cao Đẳng Sư Phạm Hoà Bình'
        },
        {
            id: 'CĐ.I.173.0',
            text: 'Trường Cao Đẳng Sư Phạm Lạng Sơn'
        },
        {
            id: 'CĐ.I.174.0',
            text: 'Trường Cao Đẳng Sư Phạm Lào Cai'
        },
        {
            id: 'CĐ.I.175.0',
            text: 'Trường Cao Đẳng Sư Phạm Quảng Ninh'
        },
        {
            id: 'CĐ.I.176.0',
            text: 'Trường Cao Đẳng Sư Phạm Thái Nguyên'
        },
        {
            id: 'CĐ.I.177.0',
            text: 'Trường Cao Đẳng Sư Phạm Yên Bái'
        },
        {
            id: 'CĐ.I.178.0',
            text: 'Trường Cao Đẳng Thương Mại Và Du Lịch'
        },
        {
            id: 'CĐ.I.179.0',
            text: 'Trường Cao Đẳng Văn Hoá Nghệ Thuật Du Lịch Yên Bái'
        },
        {
            id: 'CĐ.I.180.0',
            text: 'Trường Cao Đẳng Văn Hoá Nghệ Thuật Tây Bắc'
        },
        {
            id: 'CĐ.I.181.0',
            text: 'Trường Cao Đẳng Văn Hoá Nghệ Thuật Và Du Lịch Hạ Long'
        },
        {
            id: 'CĐ.I.182.0',
            text: 'Trường Cao Đẳng Văn Hoá Nghệ Thuật Việt Bắc'
        },
        {
            id: 'CĐ.I.183.0',
            text: 'Trường Cao Đẳng Y Tế Điện Biên'
        },
        {
            id: 'CĐ.I.184.0',
            text: 'Trường Cao Đẳng Y Tế Lạng Sơn'
        },
        {
            id: 'CĐ.I.185.0',
            text: 'Trường Cao Đẳng Y Tế Phú Thọ'
        },
        {
            id: 'CĐ.I.186.0',
            text: 'Trường Cao Đẳng Y Tế Quảng Ninh'
        },
        {
            id: 'CĐ.I.187.0',
            text: 'Trường Cao Đẳng Y Tế Sơn La'
        },
        {
            id: 'CĐ.I.188.0',
            text: 'Trường Cao Đẳng Y Tế Thái Nguyên'
        },
        {
            id: 'CĐ.I.189.0',
            text: 'Trường Cao Đẳng Y Tế Yên Bái'
        },
        {
            id: 'CĐ.II.190.0',
            text: 'Trường Cao Đẳng Cộng Đồng Hà Nội'
        },
        {
            id: 'CĐ.II.191.0',
            text: 'Trường Cao Đẳng Cộng Đồng Hà Tây'
        },
        {
            id: 'CĐ.II.192.0',
            text: 'Trường Cao Đẳng Cộng Đồng Hải Phòng'
        },
        {
            id: 'CĐ.II.193.0',
            text: 'Trường Cao Đẳng Công Nghệ Và Kinh Tế Hà Nội'
        },
        {
            id: 'CĐ.II.194.0',
            text: 'Trường Cao Đẳng Công Nghệ Viettronics'
        },
        {
            id: 'CĐ.II.196.0',
            text: 'Trường Cao Đẳng Công Nghiệp Hưng Yên'
        },
        {
            id: 'CĐ.II.197.0',
            text: 'Trường Cao Đẳng Công Nghiệp In'
        },
        {
            id: 'CĐ.II.198.0',
            text: 'Trường Cao Đẳng Công Nghiệp Nam Định'
        },
        {
            id: 'CĐ.II.199.0',
            text: 'Trường Cao Đẳng Công Nghiệp Phúc Yên'
        },
        {
            id: 'CĐ.II.200.0',
            text: 'Trường Cao Đẳng Điện Tử - Điện Lạnh Hà Nội'
        },
        {
            id: 'CĐ.II.201.0',
            text: 'Trường Cao Đẳng Du Lịch Hà Nội'
        },
        {
            id: 'CĐ.II.202.0',
            text: 'Trường Cao Đẳng Du Lịch Và Thương Mại'
        },
        {
            id: 'CĐ.II.203.0',
            text: 'Trường Cao Đẳng Dược Trung Ương'
        },
        {
            id: 'CĐ.II.204.0',
            text: 'Trường Cao Đẳng Hải Dương'
        },
        {
            id: 'CĐ.II.205.0',
            text: 'Trường Cao Đẳng Hàng Hải I'
        },
        {
            id: 'CĐ.II.206.0',
            text: 'Trường Cao Đẳng Kinh Tế - Kỹ Thuật Thương Mại'
        },
        {
            id: 'CĐ.II.207.0',
            text: 'Trường Cao Đẳng Kinh Tế - Kỹ Thuật Trung Ương'
        },
        {
            id: 'CĐ.II.208.0',
            text: 'Trường Cao Đẳng Kinh Tế - Kỹ Thuật Vĩnh Phúc'
        },
        {
            id: 'CĐ.II.209.0',
            text: 'Trường Cao Đẳng Kinh Tế Công Nghiệp Hà Nội'
        },
        {
            id: 'CĐ.II.210.0',
            text: 'Trường Cao Đẳng Múa Việt Nam'
        },
        {
            id: 'CĐ.II.211.0',
            text: 'Trường Cao Đẳng Nghệ Thuật Hà Nội'
        },
        {
            id: 'CĐ.II.212.0',
            text: 'Trường Cao Đẳng Nông Nghiệp Và Phát Triển Nông Thôn Bắc Bộ '
        },
        {
            id: 'CĐ.II.213.0',
            text: 'Trường Cao Đẳng Phát Thanh Truyền Hình I'
        },
        {
            id: 'CĐ.II.214.0',
            text: 'Trường Cao Đẳng Sư Phạm Bắc Ninh'
        },
        {
            id: 'CĐ.II.215.0',
            text: 'Trường Cao Đẳng Sư Phạm Hà Nam'
        },
        {
            id: 'CĐ.II.216.0',
            text: 'Trường Cao Đẳng Sư Phạm Hà Nội'
        },
        {
            id: 'CĐ.II.217.0',
            text: 'Trường Cao Đẳng Sư Phạm Hà Tây'
        },
        {
            id: 'CĐ.II.218.0',
            text: 'Trường Cao Đẳng Sư Phạm Hưng Yên'
        },
        {
            id: 'CĐ.II.219.0',
            text: 'Trường Cao Đẳng Sư Phạm Nam Định'
        },
        {
            id: 'CĐ.II.220.0',
            text: 'Trường Cao Đẳng Sư Phạm Thái Bình'
        },
        {
            id: 'CĐ.II.221.0',
            text: 'Trường Cao Đẳng Sư Phạm Trung Ương'
        },
        {
            id: 'CĐ.II.222.0',
            text: 'Trường Cao Đẳng Thống Kê'
        },
        {
            id: 'CĐ.II.223.0',
            text: 'Trường Cao Đẳng Thương Mại Và Du Lịch Hà Nội'
        },
        {
            id: 'CĐ.II.224.0',
            text: 'Trường Cao Đẳng Thuỷ Lợi Bắc Bộ'
        },
        {
            id: 'CĐ.II.225.0',
            text: 'Trường Cao Đẳng Thuỷ Sản'
        },
        {
            id: 'CĐ.II.226.0',
            text: 'Trường Cao Đẳng Truyền Hình'
        },
        {
            id: 'CĐ.II.227.0',
            text: 'Trường Cao Đẳng Văn Hoá Nghệ Thuật Thái Bình'
        },
        {
            id: 'CĐ.II.228.0',
            text: 'Trường Cao Đẳng Vĩnh Phúc'
        },
        {
            id: 'CĐ.II.229.0',
            text: 'Trường Cao Đẳng Xây Dựng Công Trình Đô Thị'
        },
        {
            id: 'CĐ.II.230.0',
            text: 'Trường Cao Đẳng Xây Dựng Nam Định'
        },
        {
            id: 'CĐ.II.231.0',
            text: 'Trường Cao Đẳng Xây Dựng Số 1'
        },
        {
            id: 'CĐ.II.232.0',
            text: 'Trường Cao Đẳng Y Tế Bạch Mai'
        },
        {
            id: 'CĐ.II.233.0',
            text: 'Trường Cao Đẳng Y Tế Hà Đông'
        },
        {
            id: 'CĐ.II.234.0',
            text: 'Trường Cao Đẳng Y Tế Hà Nam'
        },
        {
            id: 'CĐ.II.235.0',
            text: 'Trường Cao Đẳng Y Tế Hà Nội'
        },
        {
            id: 'CĐ.II.236.0',
            text: 'Trường Cao Đẳng Y Tế Hải Phòng'
        },
        {
            id: 'CĐ.II.237.0',
            text: 'Trường Cao Đẳng Y Tế Hưng Yên'
        },
        {
            id: 'CĐ.II.238.0',
            text: 'Trường Cao Đẳng Y Tế Ninh Bình'
        },
        {
            id: 'CĐ.II.239.0',
            text: 'Trường Cao Đẳng Y Tế Thái Bình'
        },
        {
            id: 'CĐ.III.240.0',
            text: 'Trường Cao Đẳng Công Nghiệp Huế'
        },
        {
            id: 'CĐ.III.241.0',
            text: 'Trường Cao Đẳng Giao Thông Vận Tải Miền Trung'
        },
        {
            id: 'CĐ.III.242.0',
            text: 'Trường Cao Đẳng Kinh Tế - Kỹ Thuật Công Thương'
        },
        {
            id: 'CĐ.III.243.0',
            text: 'Trường Cao Đẳng Sư Phạm Nghệ An'
        },
        {
            id: 'CĐ.III.244.0',
            text: 'Trường Cao Đẳng Sư Phạm Quảng Trị'
        },
        {
            id: 'CĐ.III.245.0',
            text: 'Trường Cao Đẳng Sư Phạm Thừa Thiên Huế'
        },
        {
            id: 'CĐ.III.246.0',
            text: 'Trường Cao Đẳng Tài Nguyên Và Môi Trường Miền Trung'
        },
        {
            id: 'CĐ.III.247.0',
            text: 'Trường Cao Đẳng Thể Dục Thể Thao Thanh Hoá'
        },
        {
            id: 'CĐ.III.250.0',
            text: 'Trường Cao Đẳng Y Tế Hà Tĩnh'
        },
        {
            id: 'CĐ.III.251.0',
            text: 'Trường Cao Đẳng Y Tế Huế'
        },
        {
            id: 'CĐ.IV.253.0',
            text: 'Trường Cao Đẳng Bình Định'
        },
        {
            id: 'CĐ.IV.254.0',
            text: 'Trường Cao Đẳng Cộng Đồng Bình Thuận'
        },
        {
            id: 'CĐ.IV.255.0',
            text: 'Trường Cao Đẳng Công Nghệ - Kinh Tế Và Thủy Lợi Miền Trung '
        },
        {
            id: 'CĐ.IV.256.0',
            text: 'Trường Cao Đẳng Công Nghệ Thông Tin Hữu Nghị Việt - Hàn'
        },
        {
            id: 'CĐ.IV.257.0',
            text: 'Trường Cao Đẳng Công Nghiệp Tuy Hoà'
        },
        {
            id: 'CĐ.IV.258.0',
            text: 'Trường Cao Đẳng Điện Lực Miền Trung'
        },
        {
            id: 'CĐ.IV.259.0',
            text: 'Trường Cao Đẳng Giao Thông Vận Tải II'
        },
        {
            id: 'CĐ.IV.260.0',
            text: 'Trường Cao Đẳng Kinh Tế - Kế Hoạch Đà Nẵng'
        },
        {
            id: 'CĐ.IV.261.0',
            text: 'Trường Cao Đẳng Kinh Tế - Kỹ Thuật Quảng Nam'
        },
        {
            id: 'CĐ.IV.262.0',
            text: 'Trường Cao Đẳng Lương Thực Thực Phẩm'
        },
        {
            id: 'CĐ.IV.263.0',
            text: 'Trường Cao Đẳng Sư Phạm Nha Trang'
        },
        {
            id: 'CĐ.IV.264.0',
            text: 'Trường Cao Đẳng Sư Phạm Ninh Thuận'
        },
        {
            id: 'CĐ.IV.265.0',
            text: 'Trường Cao Đẳng Sư Phạm Trung Ương Nha Trang'
        },
        {
            id: 'CĐ.IV.266.0',
            text: 'Trường Cao Đẳng Thương Mại'
        },
        {
            id: 'CĐ.IV.267.0',
            text: 'Trường Cao Đẳng Văn Hóa Nghệ Thuật Và Du Lịch Nha Trang'
        },
        {
            id: 'CĐ.IV.268.0',
            text: 'Trường Cao Đẳng Y Tế Bình Định'
        },
        {
            id: 'CĐ.IV.269.0',
            text: 'Trường Cao Đẳng Y Tế Bình Thuận'
        },
        {
            id: 'CĐ.IV.270.0',
            text: 'Trường Cao Đẳng Y Tế Đặng Thùy Trâm'
        },
        {
            id: 'CĐ.IV.272.0',
            text: 'Trường Cao Đẳng Y Tế Phú Yên'
        },
        {
            id: 'CĐ.IV.273.0',
            text: 'Trường Cao Đẳng Y Tế Quảng Nam'
        },
        {
            id: 'CĐ.IX.335.0',
            text: 'Trường Cao Đẳng An Ninh Nhân Dân I'
        },
        {
            id: 'CĐ.IX.336.0',
            text: 'Trường Cao Đẳng An Ninh Nhân Dân II'
        },
        {
            id: 'CĐ.IX.337.0',
            text: 'Trường Cao Đẳng Cảnh Sát Nhân Dân I'
        },
        {
            id: 'CĐ.IX.338.0',
            text: 'Trường Cao Đẳng Cảnh Sát Nhân Dân II'
        },
        {
            id: 'CĐ.V.275.0',
            text: 'Trường Cao Đẳng Kinh Tế - Kỹ Thuật Kon Tum'
        },
        {
            id: 'CĐ.V.277.0',
            text: 'Trường Cao Đẳng Sư Phạm Đà Lạt'
        },
        {
            id: 'CĐ.V.278.0',
            text: 'Trường Cao Đẳng Sư Phạm Đăk Lăk'
        },
        {
            id: 'CĐ.V.279.0',
            text: 'Trường Cao Đẳng Sư Phạm Gia Lai'
        },
        {
            id: 'CĐ.V.280.0',
            text: 'Trường Cao Đẳng Sư Phạm Kon Tum'
        },
        {
            id: 'CĐ.V.281.0',
            text: 'Trường Cao Đẳng Văn Hoá Nghệ Thuật Đăk Lăk'
        },
        {
            id: 'CĐ.V.282.0',
            text: 'Trường Cao Đẳng Y Tế Lâm Đồng'
        },
        {
            id: 'CĐ.VI.283.0',
            text: 'Trường Cao Đẳng Cộng Đồng Bà Rịa - Vũng Tàu'
        },
        {
            id: 'CĐ.VI.284.0',
            text: 'Trường Cao Đẳng Công Nghệ Thủ Đức'
        },
        {
            id: 'CĐ.VI.286.0',
            text: 'Trường Cao Đẳng Công Nghiệp Cao Su'
        },
        {
            id: 'CĐ.VI.287.0',
            text: 'Trường Cao Đẳng Công Thương Thành Phố Hồ Chí Minh'
        },
        {
            id: 'CĐ.VI.288.0',
            text: 'Trường Cao Đẳng Điện Lực Thành phố Hồ Chí Minh'
        },
        {
            id: 'CĐ.VI.289.0',
            text: 'Trường Cao Đẳng Giao Thông Vận Tải III'
        },
        {
            id: 'CĐ.VI.290.0',
            text: 'Trường Cao Đẳng Giao Thông Vận Tải Thành phố Hồ Chí Minh'
        },
        {
            id: 'CĐ.VI.291.0',
            text: 'Trường Cao Đẳng Kinh Tế - Kỹ Thuật Phú Lâm'
        },
        {
            id: 'CĐ.VI.292.0',
            text: 'Trường Cao Đẳng Kinh Tế - Kỹ Thuật Vinatex Thành phố Hồ Chí Minh'
        },
        {
            id: 'CĐ.VI.293.0',
            text: 'Trường Cao Đẳng Kinh Tế Đối Ngoại'
        },
        {
            id: 'CĐ.VI.295.0',
            text: 'Trường Cao Đẳng Kỹ Thuật Cao Thắng'
        },
        {
            id: 'CĐ.VI.296.0',
            text: 'Trường Cao Đẳng Kỹ Thuật Lý Tự Trọng Thành phố Hồ Chí Minh '
        },
        {
            id: 'CĐ.VI.297.0',
            text: 'Trường Cao Đẳng Mỹ Thuật Trang Trí Đồng Nai'
        },
        {
            id: 'CĐ.VI.298.0',
            text: 'Trường Cao Đẳng Phát Thanh Truyền Hình II'
        },
        {
            id: 'CĐ.VI.299.0',
            text: 'Trường Cao Đẳng Sư Phạm Bà Rịa-Vũng Tàu'
        },
        {
            id: 'CĐ.VI.300.0',
            text: 'Trường Cao Đẳng Sư Phạm Bình Phước'
        },
        {
            id: 'CĐ.VI.301.0',
            text: 'Trường Cao Đẳng Sư Phạm Tây Ninh'
        },
        {
            id: 'CĐ.VI.302.0',
            text: 'Trường Cao Đẳng Sư Phạm Trung Ương Thành phố Hồ Chí Minh'
        },
        {
            id: 'CĐ.VI.303.0',
            text: 'Trường Cao Đẳng Tài Chính Hải Quan'
        },
        {
            id: 'CĐ.VI.304.0',
            text: 'Trường Cao Đẳng Văn Hoá Nghệ Thuật Thành phố Hồ Chí Minh'
        },
        {
            id: 'CĐ.VI.305.0',
            text: 'Trường Cao Đẳng Xây Dựng Số 2'
        },
        {
            id: 'CĐ.VI.306.0',
            text: 'Trường Cao Đẳng Y Tế Bình Dương'
        },
        {
            id: 'CĐ.VI.307.0',
            text: 'Trường Cao Đẳng Y Tế Đồng Nai'
        },
        {
            id: 'CĐ.VII.308.0',
            text: 'Trường Cao Đẳng Bến Tre'
        },
        {
            id: 'CĐ.VII.309.0',
            text: 'Trường Cao Đẳng Cần Thơ'
        },
        {
            id: 'CĐ.VII.310.0',
            text: 'Trường Cao Đẳng Cơ Điện Và Nông Nghiệp Nam Bộ'
        },
        {
            id: 'CĐ.VII.311.0',
            text: 'Trường Cao Đẳng Cộng Đồng Cà Mau'
        },
        {
            id: 'CĐ.VII.312.0',
            text: 'Trường Cao Đẳng Cộng Đồng Đồng Tháp'
        },
        {
            id: 'CĐ.VII.313.0',
            text: 'Trường Cao Đẳng Cộng Đồng Hậu Giang'
        },
        {
            id: 'CĐ.VII.314.0',
            text: 'Trường Cao Đẳng Cộng Đồng Kiên Giang'
        },
        {
            id: 'CĐ.VII.315.0',
            text: 'Trường Cao Đẳng Cộng Đồng Sóc Trăng'
        },
        {
            id: 'CĐ.VII.316.0',
            text: 'Trường Cao Đẳng Cộng Đồng Vĩnh Long'
        },
        {
            id: 'CĐ.VII.317.0',
            text: 'Trường Cao Đẳng Kinh Tế - Kỹ Thuật Cần Thơ'
        },
        {
            id: 'CĐ.VII.318.0',
            text: 'Trường Cao Đẳng Kinh Tế - Tài Chính Vĩnh Long'
        },
        {
            id: 'CĐ.VII.319.0',
            text: 'Trường Cao Đẳng Kinh Tế Kỹ Thuật Kiên Giang'
        },
        {
            id: 'CĐ.VII.320.0',
            text: 'Trường Cao Đẳng Nông Nghiệp Nam Bộ'
        },
        {
            id: 'CĐ.VII.321.0',
            text: 'Trường Cao Đẳng Sư Phạm Cà Mau'
        },
        {
            id: 'CĐ.VII.322.0',
            text: 'Trường Cao Đẳng Sư Phạm Kiên Giang'
        },
        {
            id: 'CĐ.VII.324.0',
            text: 'Trường Cao Đẳng Sư Phạm Sóc Trăng'
        },
        {
            id: 'CĐ.VII.325.0',
            text: 'Trường Cao Đẳng Sư Phạm Vĩnh Long'
        },
        {
            id: 'CĐ.VII.326.0',
            text: 'Trường Cao Đẳng Y Tế Bạc Liêu'
        },
        {
            id: 'CĐ.VII.327.0',
            text: 'Trường Cao Đẳng Y Tế Cà Mau'
        },
        {
            id: 'CĐ.VII.328.0',
            text: 'Trường Cao Đẳng Y Tế Cần Thơ'
        },
        {
            id: 'CĐ.VII.329.0',
            text: 'Trường Cao Đẳng Y Tế Đồng Tháp'
        },
        {
            id: 'CĐ.VII.330.0',
            text: 'Trường Cao Đẳng Y Tế Kiên Giang'
        },
        {
            id: 'CĐ.VII.331.0',
            text: 'Trường Cao Đẳng Y Tế Tiền Giang'
        },
        {
            id: 'CĐ.VII.332.0',
            text: 'Trường Cao Đẳng Y Tế Trà Vinh'
        },
        {
            id: 'CĐ.VIII.333.0',
            text: 'Trường Cao Đẳng Công Nghiệp Quốc Phòng'
        },
        {
            id: 'CĐ.VIII.334.0',
            text: 'Trường Cao Đẳng Công Nghệ Và Kỹ Thuật Ô Tô'
        },
        {
            id: 'ĐH.I.1.0',
            text: 'Đại Học Thái Nguyên (7 Trường Đh, 2 Khoa, 1 Trường Cđ)'
        },
        {
            id: 'ĐH.I.1.1',
            text: 'Đại Học Thái Nguyên - Trường Đại Học Sư Phạm'
        },
        {
            id: 'ĐH.I.1.10',
            text: 'Đại Học Thái Nguyên - Trường Cao Đẳng Kinh Tế - Kỹ Thuật'
        },
        {
            id: 'ĐH.I.1.2',
            text: 'Đại Học Thái Nguyên - Trường Đại Học Kỹ Thuật Công Nghiệp'
        },
        {
            id: 'ĐH.I.1.3',
            text: 'Đại Học Thái Nguyên - Trường Đại Học Nông Lâm'
        },
        {
            id: 'ĐH.I.1.4',
            text: 'Đại Học Thái Nguyên - Trường Đại Học Y Dược'
        },
        {
            id: 'ĐH.I.1.5',
            text: 'Đại Học Thái Nguyên -Trường Đại Học Kinh Tế Và Quản Trị Kinh Doanh'
        },
        {
            id: 'ĐH.I.1.6',
            text: 'Đại Học Thái Nguyên - Trường Đại Học Khoa Học'
        },
        {
            id: 'ĐH.I.1.7',
            text: 'Đại Học Thái Nguyên - Trường Đại Học Công Nghệ Thông Tin Và Truyền Thông'
        },
        {
            id: 'ĐH.I.1.8',
            text: 'Đại Học Thái Nguyên'
        },
        {
            id: 'ĐH.I.1.9',
            text: 'Đại Học Thái Nguyên - Khoa Quốc Tế'
        },
        {
            id: 'ĐH.I.2.0',
            text: 'Trường Đại Học Công Nghiệp Quảng Ninh'
        },
        {
            id: 'ĐH.I.3.0',
            text: 'Trường Đại Học Công Nghiệp Việt Trì'
        },
        {
            id: 'ĐH.I.4.0',
            text: 'Trường Đại Học Hùng Vương'
        },
        {
            id: 'ĐH.I.5.0',
            text: 'Trường Đại Học Nông Lâm Bắc Giang'
        },
        {
            id: 'ĐH.I.6.0',
            text: 'Trường Đại Học Tân Trào'
        },
        {
            id: 'ĐH.I.7.0',
            text: 'Trường Đại Học Tây Bắc'
        },
        {
            id: 'ĐH.II.10.0',
            text: 'Học Viện Âm Nhạc Quốc Gia Việt Nam'
        },
        {
            id: 'ĐH.II.11.0',
            text: 'Học Viện Báo Chí Và Tuyên Truyền'
        },
        {
            id: 'ĐH.II.12.0',
            text: 'Học Viện Chính Sách Và Phát Triển'
        },
        {
            id: 'ĐH.II.13.0',
            text: 'Học Viện Chính Trị - Hành Chính Khu Vực I'
        },
        {
            id: 'ĐH.II.14.0',
            text: 'Học Viện Công Nghệ Bưu Chính Viễn Thông'
        },
        {
            id: 'ĐH.II.15.0',
            text: 'Học Viện Hành Chính Quốc Gia'
        },
        {
            id: 'ĐH.II.16.0',
            text: 'Học Viện Khoa Học Xã Hội'
        },
        {
            id: 'ĐH.II.17.0',
            text: 'Học Viện Ngân Hàng'
        },
        {
            id: 'ĐH.II.18.0',
            text: 'Học Viện Ngoại Giao'
        },
        {
            id: 'ĐH.II.19.0',
            text: 'Học Viện Phụ Nữ Việt Nam'
        },
        {
            id: 'ĐH.II.20.0',
            text: 'Học Viện Quản Lý Giáo Dục'
        },
        {
            id: 'ĐH.II.21.0',
            text: 'Học Viện T ài Chính'
        },
        {
            id: 'ĐH.II.22.0',
            text: 'Học Viện Thanh Thiếu Niên Việt Nam'
        },
        {
            id: 'ĐH.II.23.0',
            text: 'Học Viện Y Dược Học Cổ Truyền Việt Nam'
        },
        {
            id: 'ĐH.II.24.0',
            text: 'Trường Đại Học Bách Khoa Hà Nội'
        },
        {
            id: 'ĐH.II.25.0',
            text: 'Trường Đại Học Công Đoàn'
        },
        {
            id: 'ĐH.II.26.0',
            text: 'Trường Đại Học Công Nghệ Giao Thông Vận Tải'
        },
        {
            id: 'ĐH.II.27.0',
            text: 'Trường Đại Học Công Nghiệp Hà Nội'
        },
        {
            id: 'ĐH.II.28.0',
            text: 'Trường Đại Học Công Nghiệp Việt - Hung'
        },
        {
            id: 'ĐH.II.29.0',
            text: 'Trường Đại Học Dầu Khí Việt Nam'
        },
        {
            id: 'ĐH.II.30.0',
            text: 'Trường Đại Học Điện Lực'
        },
        {
            id: 'ĐH.II.31.0',
            text: 'Trường Đại Học Điều Dưỡng Nam Định'
        },
        {
            id: 'ĐH.II.32.0',
            text: 'Trường Đại Học Dược Hà Nội'
        },
        {
            id: 'ĐH.II.33.0',
            text: 'Trường Đại Học Giao Thông Vận Tải'
        },
        {
            id: 'ĐH.II.34.0',
            text: 'Trường Đại Học Hà Nội'
        },
        {
            id: 'ĐH.II.35.0',
            text: 'Trường Đại Học Hải Dương'
        },
        {
            id: 'ĐH.II.36.0',
            text: 'Trường Đại Học Hải Phòng'
        },
        {
            id: 'ĐH.II.37.0',
            text: 'Trường Đại Học Hàng Hải'
        },
        {
            id: 'ĐH.II.38.0',
            text: 'Trường Đại Học Hoa Lư'
        },
        {
            id: 'ĐH.II.39.0',
            text: 'Trường Đại Học Khoa Học Và Công Nghệ Hà Nội'
        },
        {
            id: 'ĐH.II.40.0',
            text: 'Trường Đại Học Kiểm Sát Hà Nội'
        },
        {
            id: 'ĐH.II.41.0',
            text: 'Trường Đại Học Kiến Trúc Hà Nội'
        },
        {
            id: 'ĐH.II.42.0',
            text: 'Trường Đại Học Kinh Tế Kỹ Thuật Công Nghiệp'
        },
        {
            id: 'ĐH.II.43.0',
            text: 'Trường Đại Học Kinh Tế Quốc Dân'
        },
        {
            id: 'ĐH.II.44.0',
            text: 'Trường Đại Học Kỹ Thuật Y Tế Hải Dương'
        },
        {
            id: 'ĐH.II.45.0',
            text: 'Trường Đại Học Lâm Nghiệp'
        },
        {
            id: 'ĐH.II.46.0',
            text: 'Trường Đại Học Lao Động - Xã Hội'
        },
        {
            id: 'ĐH.II.47.0',
            text: 'Trường Đại Học Luật Hà Nội'
        },
        {
            id: 'ĐH.II.48.0',
            text: 'Trường Đại Học Mỏ Địa Chất'
        },
        {
            id: 'ĐH.II.49.0',
            text: 'Trường Đại Học Mỹ Thuật Công Nghiệp'
        },
        {
            id: 'ĐH.II.50.0',
            text: 'Trường Đại Học Mỹ Thuật Việt Nam'
        },
        {
            id: 'ĐH.II.51.0',
            text: 'Trường Đại Học Ngoại Thương'
        },
        {
            id: 'ĐH.II.53.0',
            text: 'Trường Đại Học Nông Nghiệp Hà Nội'
        },
        {
            id: 'ĐH.II.54.0',
            text: 'Trường Đại Học Sân Khấu Điện Ảnh Hà Nội'
        },
        {
            id: 'ĐH.II.55.0',
            text: 'Trường Đại Học Sao Đỏ'
        },
        {
            id: 'ĐH.II.56.0',
            text: 'Trường Đại Học Sư Phạm Hà Nội'
        },
        {
            id: 'ĐH.II.57.0',
            text: 'Trường Đại Học Sư Phạm Hà Nội 2'
        },
        {
            id: 'ĐH.II.58.0',
            text: 'Trường Đại Học Sư Phạm Kỹ Thuật Hưng Yên'
        },
        {
            id: 'ĐH.II.59.0',
            text: 'Trường Đại Học Sư Phạm Kỹ Thuật Nam Định'
        },
        {
            id: 'ĐH.II.60.0',
            text: 'Trường Đại Học Sư Phạm Nghệ Thuật Trung Ương'
        },
        {
            id: 'ĐH.II.61.0',
            text: 'Trường Đại Học Sư Phạm Thể Dục Thể Thao Hà Nội'
        },
        {
            id: 'ĐH.II.62.0',
            text: 'Trường Đại Học Tài Chính - Quản Trị Kinh Doanh'
        },
        {
            id: 'ĐH.II.63.0',
            text: 'Trường Đại Học Tài Nguyên Và Môi Trường Hà Nội'
        },
        {
            id: 'ĐH.II.64.0',
            text: 'Trường Đại Học Thái Bình'
        },
        {
            id: 'ĐH.II.65.0',
            text: 'Trường Đại Học Thể Dục Thể Thao Bắc Ninh'
        },
        {
            id: 'ĐH.II.66.0',
            text: 'Trường Đại Học Thương Mại'
        },
        {
            id: 'ĐH.II.67.0',
            text: 'Trường Đại Học Thuỷ Lợi'
        },
        {
            id: 'ĐH.II.68.0',
            text: 'Trường Đại Học Văn Hoá Hà Nội'
        },
        {
            id: 'ĐH.II.69.0',
            text: 'Trường Đại Học Xây Dựng'
        },
        {
            id: 'ĐH.II.70.0',
            text: 'Trường Đại Học Y Hà Nội'
        },
        {
            id: 'ĐH.II.71.0',
            text: 'Trường Đại Học Y Hải Phòng'
        },
        {
            id: 'ĐH.II.72.0',
            text: 'Trường Đại Học Y Tế Công Cộng'
        },
        {
            id: 'ĐH.II.73.0',
            text: 'Trường Đại Học Y Thái Bình'
        },
        {
            id: 'ĐH.II.74.0',
            text: 'Viện Đại Học Mở Hà Nội'
        },
        {
            id: 'ĐH.II.8.0',
            text: 'Đại Học Quốc Gia Hà Nội (06 Trường Đh, 03 Khoa)'
        },
        {
            id: 'ĐH.II.8.1',
            text: 'ĐHQG.HN - Trường Đại Học Khoa Học Tự Nhiên'
        },
        {
            id: 'ĐH.II.8.2',
            text: 'ĐHQG.HN - Trường Đại Học Khoa Học Xã Hội Nhân Văn'
        },
        {
            id: 'ĐH.II.8.3',
            text: 'ĐHQG.HN - Trường Đại Học Ngoại Ngữ'
        },
        {
            id: 'ĐH.II.8.4',
            text: 'ĐHQG.HN - Trường Đại Học Công Nghệ'
        },
        {
            id: 'ĐH.II.8.5',
            text: 'ĐHQG.HN - Trường Đại Học Kinh Tế'
        },
        {
            id: 'ĐH.II.8.6',
            text: 'ĐHQG.HN - Trường Đại Học Giáo Dục'
        },
        {
            id: 'ĐH.II.8.7',
            text: 'ĐHQG.HN - Khoa Luật'
        },
        {
            id: 'ĐH.II.8.8',
            text: 'ĐHQG.HN - Khoa Y Dược'
        },
        {
            id: 'ĐH.II.8.9',
            text: 'ĐHQG.HN - Khoa Quốc Tế'
        },
        {
            id: 'ĐH.III.75.0',
            text: 'Đại Học Huế (07 Trường Đh, 01 Phân Hiệu, 03 Khoa)'
        },
        {
            id: 'ĐH.III.75.1',
            text: 'Đại Học Huế - Trường Đại Học Sư Phạm'
        },
        {
            id: 'ĐH.III.75.10',
            text: 'Đại Học Huế - Khoa Giáo Dục Thể Chất'
        },
        {
            id: 'ĐH.III.75.11',
            text: 'Đại Học Huế - Khoa Du Lịch'
        },
        {
            id: 'ĐH.III.75.2',
            text: 'Đại Học Huế - Trường Đại Học Khoa Học'
        },
        {
            id: 'ĐH.III.75.3',
            text: 'Đại Học Huế - Trường Đại Học Nông Lâm'
        },
        {
            id: 'ĐH.III.75.4',
            text: 'Đại Học Huế - Trường Đại Học Y Dược'
        },
        {
            id: 'ĐH.III.75.5',
            text: 'Đại Học Huế - Trường Đại Học Ngoại Ngữ'
        },
        {
            id: 'ĐH.III.75.6',
            text: 'Đại Học Huế - Trường Đại Học Kinh Tế'
        },
        {
            id: 'ĐH.III.75.7',
            text: 'Đại Học Huế - Trường Đại Học Nghệ Thuật'
        },
        {
            id: 'ĐH.III.75.8',
            text: 'Đại Học Huế - Phân Hiệu Đại Học Huế Tại Quảng Trị'
        },
        {
            id: 'ĐH.III.75.9',
            text: 'Đại Học Huế - Khoa Luật'
        },
        {
            id: 'ĐH.III.76.0',
            text: 'Học Viện Âm Nhạc Huế'
        },
        {
            id: 'ĐH.III.77.0',
            text: 'Trường Đại Học Hà Tĩnh'
        },
        {
            id: 'ĐH.III.78.0',
            text: 'Trường Đại Học Hồng Đức'
        },
        {
            id: 'ĐH.III.79.0',
            text: 'Trường Đại Học Kinh Tế Nghệ An'
        },
        {
            id: 'ĐH.III.80.0',
            text: 'Trường Đại Học Quảng Bình'
        },
        {
            id: 'ĐH.III.81.0',
            text: 'Trường Đại Học Sư Phạm Kỹ Thuật Vinh'
        },
        {
            id: 'ĐH.III.82.0',
            text: 'Trường Đại Học Văn Hoá, Thể Thao Và Du Lịch Thanh Hoá'
        },
        {
            id: 'ĐH.III.83.0',
            text: 'Trường Đại Học Vinh'
        },
        {
            id: 'ĐH.III.84.0',
            text: 'Trường Đại Học Y Khoa Vinh'
        },
        {
            id: 'ĐH.IV.85.0',
            text: 'Đại Học Đà Nẵng (04 Trường Đh, 02 Trường Cđ, 01 Phân Hiệu, 01 Khoa)'
        },
        {
            id: 'ĐH.IV.85.1',
            text: 'Đại Học Đà Nẵng - Trường Đại Học Bách Khoa'
        },
        {
            id: 'ĐH.IV.85.2',
            text: 'Đại Học Đà Nẵng - Trường Đại Học Kinh Tế'
        },
        {
            id: 'ĐH.IV.85.3',
            text: 'Đại Học Đà Nẵng - Trường Đại Học Sư Phạm'
        },
        {
            id: 'ĐH.IV.85.4',
            text: 'Đại Học Đà Nẵng - Trường Đại Học Ngoại Ngữ'
        },
        {
            id: 'ĐH.IV.85.5',
            text: 'Đại Học Đà Nẵng - Trường Cao Đẳng Công Nghệ'
        },
        {
            id: 'ĐH.IV.85.6',
            text: 'Đại Học Đà Nẵng - Trường Cao Đẳng Công Nghệ Thông Tin'
        },
        {
            id: 'ĐH.IV.85.7',
            text: 'Đại Học Đà Nẵng - Phân Hiệu Đại Học Đà Nẵng Tại Kontum'
        },
        {
            id: 'ĐH.IV.85.8',
            text: 'Đại Học Đà Nẵng - Khoa Y Dược'
        },
        {
            id: 'ĐH.IV.86.0',
            text: 'Trường Đại Học Kỹ Thuật Y Dược Đà Nẵng'
        },
        {
            id: 'ĐH.IV.87.0',
            text: 'Trường Đại Học Nha Trang'
        },
        {
            id: 'ĐH.IV.88.0',
            text: 'Trường Đại Học Phạm Văn Đồng'
        },
        {
            id: 'ĐH.IV.89.0',
            text: 'Trường Đại Học Phú Yên'
        },
        {
            id: 'ĐH.IV.90.0',
            text: 'Trường Đại Học Quảng Nam'
        },
        {
            id: 'ĐH.IV.91.0',
            text: 'Trường Đại Học Quy Nhơn'
        },
        {
            id: 'ĐH.IV.93.0',
            text: 'Trường Đại Học Thể Dục Thể Thao Đà Nẵng'
        },
        {
            id: 'ĐH.IV.94.0',
            text: 'Trường Đại Học Xây Dựng Miền Trung'
        },
        {
            id: 'ĐH.IX.143.0',
            text: 'Học Viện An Ninh Nhân Dân'
        },
        {
            id: 'ĐH.IX.144.0',
            text: 'Học Viện Cảnh Sát Nhân Dân'
        },
        {
            id: 'ĐH.IX.145.0',
            text: 'Học Viện Chính Trị Công An Nhân Dân'
        },
        {
            id: 'ĐH.IX.146.0',
            text: 'Học Viện Quốc Tế'
        },
        {
            id: 'ĐH.IX.147.0',
            text: 'Trường Đại Học An Ninh Nhân Dân'
        },
        {
            id: 'ĐH.IX.148.0',
            text: 'Trường Đại Học Cảnh Sát Nhân Dân'
        },
        {
            id: 'ĐH.IX.149.0',
            text: 'Trường Đại Học Kỹ Thuật - Hậu Cần Công An Nhân Dân'
        },
        {
            id: 'ĐH.IX.150.0',
            text: 'Trường Đại Học Phòng Cháy Chữa Cháy'
        },
        {
            id: 'ĐH.V.95.0',
            text: 'Trường Đại Học Đà Lạt'
        },
        {
            id: 'ĐH.V.96.0',
            text: 'Trường Đại Học Tây Nguyên'
        },
        {
            id: 'ĐH.VI.100.0',
            text: 'Trường Đại Học Công Nghiệp Thực Phẩm Thành phố Hồ Chí Minh '
        },
        {
            id: 'ĐH.VI.101.0',
            text: 'Trường Đại Học Công Nghiệp Thành phố Hồ Chí Minh'
        },
        {
            id: 'ĐH.VI.102.0',
            text: 'Trường Đại Học Đồng Nai'
        },
        {
            id: 'ĐH.VI.103.0',
            text: 'Trường Đại Học Giao Thông Vận Tải Đại học Giao thông Vận tải Hồ Chí Minh'
        },
        {
            id: 'ĐH.VI.104.0',
            text: 'Trường Đại Học Kiến Trúc Thành Phố Hồ Chí Minh'
        },
        {
            id: 'ĐH.VI.105.0',
            text: 'Trường Đại Học Kinh Tế Thành phố Hồ Chí Minh'
        },
        {
            id: 'ĐH.VI.106.0',
            text: 'Trường Đại Học Luật Thành phố Hồ Chí Minh'
        },
        {
            id: 'ĐH.VI.107.0',
            text: 'Trường Đại Học Mở Thành phố Hồ Chí Minh'
        },
        {
            id: 'ĐH.VI.108.0',
            text: 'Trường Đại Học Mỹ Thuật Thành phố Hồ Chí Minh'
        },
        {
            id: 'ĐH.VI.109.0',
            text: 'Trường Đại Học Ngân Hàng Thành phố Hồ Chí Minh'
        },
        {
            id: 'ĐH.VI.110.0 ',
            text: 'Trường Đại Học Nông Lâm Thành phố Hồ Chí Minh'
        },
        {
            id: 'ĐH.VI.111.0 ',
            text: 'Trường Đại Học Sài Gòn'
        },
        {
            id: 'ĐH.VI.112.0 ',
            text: 'Trường Đại Học Sân Khấu, Điện Ảnh Thành phố Hồ Chí Minh'
        },
        {
            id: 'ĐH.VI.113.0',
            text: 'Trường Đại Học Sư Phạm Kỹ Thuật Thành phố Hồ Chí Minh'
        },
        {
            id: 'ĐH.VI.114.0',
            text: 'Trường Đại Học Thể Dục Thể Thao Thành Phố Hồ Chí Minh'
        },
        {
            id: 'ĐH.VI.115.0 ',
            text: 'Trường Đại Học Sư Phạm Thành phố Hồ Chí Minh'
        },
        {
            id: 'ĐH.VI.116.0',
            text: 'Trường Đại Học Tài Chính - Marketing'
        },
        {
            id: 'ĐH.VI.117.0',
            text: 'Trường Đại Học Tài Nguyên Và Môi Trường Thành phố Hồ Chí Minh'
        },
        {
            id: 'ĐH.VI.118.0 ',
            text: 'Trường Đại Học Thể Dục Thể Thao Thành Phố Hồ Chí Minh'
        },
        {
            id: 'ĐH.VI.119.0 ',
            text: 'Trường Đại Học Thủ Dầu Một'
        },
        {
            id: 'ĐH.VI.120.0 ',
            text: 'Trường Đại Học Tôn Đức Thắng'
        },
        {
            id: 'ĐH.VI.121.0 ',
            text: 'Trường Đại Học Văn Hoá Thành phố Hồ Chí Minh'
        },
        {
            id: 'ĐH.VI.122.0 ',
            text: 'Trường Đại Học Việt Đức'
        },
        {
            id: 'ĐH.VI.123.0 ',
            text: 'Trường Đại Học Y Dược Thành phố Hồ Chí Minh'
        },
        {
            id: 'ĐH.VI.124.0',
            text: 'Trường Đại Học Y Khoa Phạm Ngọc Thạch'
        },
        {
            id: 'ĐH.VI.97.0',
            text: 'Đại Học Quốc Gia Thành phố Hồ Chí Minh (06 Trường Đh, 01 Khoa)'
        },
        {
            id: 'ĐH.VI.97.1',
            text: 'ĐHQG.HCM - Trường Đại Học Bách Khoa'
        },
        {
            id: 'ĐH.VI.97.2',
            text: 'ĐHQG.HCM - Trường Đại Học Khoa Học Tự Nhiên'
        },
        {
            id: 'ĐH.VI.97.3',
            text: 'ĐHQG.HCM - Trường Đại Học Khoa Học Xã Hội Nhân Văn'
        },
        {
            id: 'ĐH.VI.97.4',
            text: 'ĐHQG.HCM - Trường Đại Học Công Nghệ Thông Tin'
        },
        {
            id: 'ĐH.VI.97.5',
            text: 'ĐHQG.HCM - Trường Đại Học Quốc Tế'
        },
        {
            id: 'ĐH.VI.97.6',
            text: 'ĐHQG.HCM - Trường Đại Học Kinh Tế - Luật'
        },
        {
            id: 'ĐH.VI.97.7',
            text: 'ĐHQG.HCM - Khoa Y'
        },
        {
            id: 'ĐH.VI.98.0 ',
            text: 'Học Viện Hàng Không Việt Nam'
        },
        {
            id: 'ĐH.VI.99.0 ',
            text: 'Nhạc Viện Thành phố Hồ Chí Minh'
        },
        {
            id: 'ĐH.VII.125.0 ',
            text: 'Trường Đại Học An Giang'
        },
        {
            id: 'ĐH.VII.126.0 ',
            text: 'Trường Đại Học Bạc Liêu'
        },
        {
            id: 'ĐH.VII.127.0 ',
            text: 'Trường Đại Học Cần Thơ'
        },
        {
            id: 'ĐH.VII.128.0 ',
            text: 'Trường Đại Học Đồng Tháp'
        },
        {
            id: 'ĐH.VII.129.0 ',
            text: 'Trường Đại Học Kỹ Thuật Công Nghệ Cần Thơ'
        },
        {
            id: 'ĐH.VII.130.0 ',
            text: 'Trường Đại Học Tiền Giang'
        },
        {
            id: 'ĐH.VII.131.0 ',
            text: 'Trường Đại Học Trà Vinh'
        },
        {
            id: 'ĐH.VII.132.0 ',
            text: 'Trường Đại Học Sư Phạm Kỹ Thuật Vĩnh Long'
        },
        {
            id: 'ĐH.VII.133.0',
            text: 'Trường Đại Học Xây Dựng Miền Tây'
        },
        {
            id: 'ĐH.VII.134.0',
            text: 'Trường Đại Học Y Dược Cần Thơ'
        },
        {
            id: 'ĐH.VIII.135.0',
            text: 'Học Viện Kỹ Thuật Quân Sự'
        },
        {
            id: 'ĐH.VIII.136.0',
            text: 'Học Viện Quân Y'
        },
        {
            id: 'ĐH.VIII.137.0',
            text: 'Học Viện Khoa Học Quân Sự'
        },
        {
            id: 'ĐH.VIII.138.0',
            text: 'Học Viện Hậu Cần'
        },
        {
            id: 'ĐH.VIII.139.0',
            text: 'Trường Đại Học Văn Hóa - Nghệ Thuật Quân Đội'
        },
        {
            id: 'ĐH.VIII.141.0',
            text: 'Trường Đại Học Ngô Quyền'
        },
        {
            id: 'ĐH.VIII.142.0',
            text: 'Trường Đại Học Thông Tin Liên Lạc'
        },
        {
            id: 'BVS',
            text: 'Học viện Công nghệ Bưu chính Viễn thông - Cơ sở 2'
        },
        {
            id: 'BPH',
            text: 'Học viện Biên phòng'
        },
        {
            id: 'BVU',
            text: 'Trường Đại học Bà Rịa - Vũng Tàu'
        },
        {
            id: 'DCD',
            text: 'Trường Đại học Công nghệ Đồng Nai'
        },
        {
            id: 'DCH',
            text: 'Trường Sĩ quan Đặc công'
        },
        {
            id: 'DCL',
            text: 'Trường Đại học Cửu Long'
        },
        {
            id: 'DDA',
            text: 'Trường Đại học Công nghệ Đông Á'
        },
        {
            id: 'DDD',
            text: 'Trường Đại học Dân lập Đông Đô'
        },
        {
            id: 'DDN',
            text: 'Trường Đại học Đại Nam'
        },
        {
            id: 'DDT',
            text: 'Trường Đại học Duy Tân'
        },
        {
            id: 'DKB',
            text: 'Trường Đại học Kinh tế - Kỹ thuật Bình Dương'
        },
        {
            id: 'DKC',
            text: 'Trường Đại học Công nghệ Thành phố Hồ Chí Minh'
        },
        {
            id: 'DLA',
            text: 'Trường Đại học Kinh tế Công nghiệp Long An'
        },
        {
            id: 'DMD',
            text: 'Trường Đại học Công nghệ miền Đông'
        },
        {
            id: 'DNC',
            text: 'Trường Đại học nam Cần Thơ'
        },
        {
            id: 'DNT',
            text: 'Trường Đại học Ngoại ngữ - Tin học Thành phố Hồ Chí Minh'
        },
        {
            id: 'DPC',
            text: 'Trường Đại học Phan Châu Trinh'
        },
        {
            id: 'DPT',
            text: 'Trường Đại học Phan Thiết'
        },
        {
            id: 'DQK',
            text: 'Trường Đại học Kinh doanh và Công nghệ Hà Nội'
        },
        {
            id: 'DSG ',
            text: 'Trường Đại học Công nghệ Sài Gòn'
        },
        {
            id: 'DTD',
            text: 'Trường Đại học Tây Đô'
        },
        {
            id: 'DTH',
            text: 'Trường Đại học Hoa Sen'
        },
        {
            id: 'DTP',
            text: 'Phân hiệu Đại học Thái Nguyên tại Lào Cai'
        },
        {
            id: 'DVX',
            text: 'Trường Đại học Công nghệ Vạn Xuân'
        },
        {
            id: 'EIU',
            text: 'Trường Đại học Quốc tế miền Đông'
        },
        {
            id: 'FBU',
            text: 'Trường Đại học Tài chính - Ngân hàng Hà Nội'
        },
        {
            id: 'HIU',
            text: 'Trường Đại học Quốc tế Hồng Bàng'
        },
        {
            id: 'HNM',
            text: 'Trường Đại học Thủ đô Hà Nội'
        },
        {
            id: 'HQH',
            text: 'Học viện Hải quân'
        },
        {
            id: 'HVC',
            text: 'Học viện Cán bộ thành phố Hồ Chí Minh'
        },
        {
            id: 'HVN',
            text: 'Học viện Nông nghiệp Việt Nam'
        },
        {
            id: 'IUQ',
            text: 'Phân hiệu Đại học Công nghiệp Thành phố Hồ Chí Minh tại Quảng Ngãi'
        },
        {
            id: 'KGH',
            text: 'Trường Sĩ quan Không quân'
        },
        {
            id: 'KTA',
            text: 'Đại học Kiến trúc Hà Nội'
        },
        {
            id: 'KTD',
            text: 'Trường Đại học Kiến trúc Đà Nẵng'
        },
        {
            id: 'LNS',
            text: 'Phân hiệu Trường Đại học Lâm Nghiệp'
        },
        {
            id: 'NLG',
            text: 'Phân hiệu Trường Đại học Nông lâm Thành phố Hồ Chí Minh tại Gia Lai'
        },
        {
            id: 'NTS',
            text: 'Trường Đại học Ngoại thương - Cơ sở phía Nam'
        },
        {
            id: 'NTT',
            text: 'Trường Đại học Nguyễn Tất Thành'
        },
        {
            id: 'PBH',
            text: 'Trường Sĩ quan Pháo binh'
        },
        {
            id: 'PCS',
            text: 'Đại học Phòng cháy Chữa cháy phía Nam'
        },
        {
            id: 'PKH',
            text: 'Học viện Phòng không - Không quân'
        },
        {
            id: 'SNH',
            text: 'Trường Sĩ quan Công binh'
        },
        {
            id: 'TBD',
            text: 'Trường Đại học Thái Bình Dương'
        },
        {
            id: 'TDD',
            text: 'Trường Đại học Thành Đô'
        },
        {
            id: 'THU',
            text: 'Trường Đại học Y khoa Tokyo Việt Nam'
        },
        {
            id: 'TKG',
            text: 'Trường Đại học Kiên Giang'
        },
        {
            id: 'TLS',
            text: 'Trường Đại học Thuỷ lợi - Cơ sở 2 ở phía Nam'
        },
        {
            id: 'TTH',
            text: 'Trường Sĩ quan Thông tin'
        },
        {
            id: 'TTU',
            text: 'Trường Đại học Tân Tạo'
        },
        {
            id: 'UKH',
            text: 'Trường Đại học Khánh Hoà'
        },
        {
            id: 'VTT',
            text: 'Trường Đại học Võ Trường Toản'
        },
        {
            id: '206',
            text: 'Trường Trung cấp Đông Dương'
        },
        {
            id: 'CSDT_KHAC',
            text: 'Khác'
        },
        {
            id: 'KMA',
            text: 'Học viện Kỹ thuật Mật mã'
        },
        {
            id: 'CĐ.II.195.0',
            text: 'Trường Đại học Công nghiệp Dệt may Hà Nội'
        },
        {
            id: 'ĐH.VIII.140.0 ',
            text: 'Trường Sĩ quan Kỹ thuật Quân sự Vinhempich (Đại học Trần Đại Nghĩa)'
        },
        {
            id: 'CĐ.VI.294.0',
            text: 'Trường Cao Đẳng Kinh Tế Thành phố Hồ Chí Minh'
        },
        {
            id: 'CĐ.III.252.0',
            text: 'Trường Cao đẳng Y tế Thanh Hóa'
        },
        {
            id: 'CĐ.V.276.0',
            text: 'Trường Cao đẳng Kinh tế Kỹ thuật Lâm Đồng'
        },
        {
            id: 'CĐ.III.248.0',
            text: 'Trường Cao đẳng Văn hóa Nghệ thuật Nghệ An'
        },
        {
            id: 'CĐ.III.249.0',
            text: 'Trường Cao đẳng Văn hóa Thể thao và Du lịch Nguyễn Du'
        },
        {
            id: 'CĐ.VII.323.0',
            text: 'Trương Cao đẳng Sư phạm Long An'
        },
        {
            id: 'ĐH.II.52.0',
            text: 'Trường Đại Học Nội Vụ Hà Nội'
        },
        {
            id: 'DLV',
            text: 'Trường Đại học Dân lập Văn Lang'
        },
        {
            id: 'CĐ.VI.285.0',
            text: 'Trường Cao đẳng Công nghệ - Quản trị Sonadezi'
        },
        {
            id: 'DVH',
            text: 'Trường Đại học Dân lập Văn Hiến'
        },
        {
            id: 'DBD',
            text: 'Trường Đại học Dân lập Bình Dương'
        },
        {
            id: 'MCA',
            text: 'Trường Đại học Mỹ thuật Công nghiệp Á Châu'
        },
        {
            id: 'DPD',
            text: 'Trường Đại học Phương Đông'
        },
        {
            id: 'DTL',
            text: 'Trường Đại học Thăng Long'
        },
        {
            id: 'FPT',
            text: 'Trường Đại học FPT'
        },
        {
            id: 'HBU',
            text: 'Trường Đại học Hòa Bình'
        },
        {
            id: 'NTU',
            text: 'Trường Đại học Nguyễn Trãi'
        },
        {
            id: 'DBH',
            text: 'Trường Đại học Quốc tế Bắc Hà'
        },
        {
            id: 'DTA',
            text: 'Trường Đại học Thành Tây'
        },
        {
            id: 'DCQ',
            text: 'Trường Đại học Công nghệ và Quản lý Hữu nghị'
        },
        {
            id: 'GSA',
            text: 'Trường Đại học Giao thông vận tải - Cơ sở 2'
        },
        {
            id: 'DLS',
            text: 'Trường Đại học Lao động Xã hội - Cơ sở TP. HCM'
        },
        {
            id: 'DCG',
            text: 'Trường Đại học Công nghệ Thông tin Gia Định'
        },
        {
            id: 'TTQ',
            text: 'Trường Đại học Quốc tế Sài Gòn'
        },
        {
            id: 'DTF',
            text: 'Khoa Ngoại ngữ (Đại học Thái Nguyên)'
        },
        {
            id: 'HLU',
            text: 'Trường Đại học Hạ Long'
        },
        {
            id: 'DVD',
            text: 'Trường Đại học Văn hóa Thể thao và Du lịch Thanh Hóa'
        },
        {
            id: 'DVB',
            text: 'Trường Đại học Việt Bắc'
        },
        {
            id: 'DCA',
            text: 'Trường Đại học Chu Văn An'
        },
        {
            id: 'DHP',
            text: 'Trường Đại học Dân lập Hải Phòng'
        },
        {
            id: 'DTV',
            text: 'Trường Đại học Dân lập Lương Thế Vinh'
        },
        {
            id: 'UKB',
            text: 'Trường Đại học Kinh Bắc'
        },
        {
            id: 'DDB',
            text: 'Trường Đại học Thành Đông'
        },
        {
            id: 'DVP',
            text: 'Trường Đại học Trưng Vương'
        },
        {
            id: 'BMTU',
            text: 'Trường Đại học Buôn Ma Thuột'
        },
        {
            id: 'DCV',
            text: 'Trường Đại học Công nghiệp Vinh'
        },
        {
            id: 'DAD',
            text: 'Trường Đại học Đông Á'
        },
        {
            id: 'DPX',
            text: 'Trường Đại học Dân lập Phú Xuân'
        },
        {
            id: 'DYD',
            text: 'Trường Đại học Dân lập Yersin Đà Lạt'
        },
        {
            id: 'DQT',
            text: 'Trường Đại học Quang Trung'
        },
        {
            id: 'DLH',
            text: 'Trường Đại học Dân lập Lạc Hồng'
        },
        {
            id: 'LCH',
            text: 'Trường Đại học Chính trị (Trường Sĩ quan Chính trị)'
        },
        {
            id: 'LAH',
            text: 'Trường Sĩ quan Lục quân 1 (Đại học Trần Quốc Tuấn)'
        },
        {
            id: 'LBH',
            text: 'Trường Sĩ quan Lục quân 2 (Đại học Nguyễn Huệ)'
        },
        {
            id: 'HGH',
            text: 'Trường Sĩ quan Phòng Hóa'
        },
        {
            id: 'CMT',
            text: 'Trường Cao đẳng Công nghệ và Môi Trường Hà Nội'
        },
        {
            id: 'CTW',
            text: 'Trường Cao đẳng Kinh tế Kỹ thuật Trung ương'
        },
        {
            id: 'CKN',
            text: 'Trường Cao đẳng Kinh tế - Kỹ thuật Hà Nội'
        },
        {
            id: 'CNH',
            text: 'Trường Cao đẳng Công nghệ Hà Nội'
        },
        {
            id: 'CBT',
            text: 'Trường Cao đẳng Công nghệ và Thương mại Hà Nội'
        },
        {
            id: 'CCG',
            text: 'Trường Cao đẳng Kỹ thuật Công nghệ Bách khoa'
        },
        {
            id: 'CEO',
            text: 'Trường Cao đẳng Đại Việt'
        },
        {
            id: 'CBV',
            text: 'Trường Cao đẳng Bách Việt'
        },
        {
            id: 'CBC',
            text: 'Trường Cao đẳng Bán công Công nghệ và Quản trị doanh nghiệp'
        },
        {
            id: 'CDC',
            text: 'Trường Cao đẳng Công nghệ Thông tin TP. HCM'
        },
        {
            id: 'CSG',
            text: 'Trường Cao đẳng Đại Việt Sài Gòn'
        },
        {
            id: 'CET',
            text: 'Trường Cao đẳng Kinh tế - Công nghệ TP. HCM'
        },
        {
            id: 'CKM',
            text: 'Trường Cao đẳng Kinh tế Kỹ thuật Miền Nam'
        },
        {
            id: 'CVX',
            text: 'Trường Cao đẳng Kỹ thuật Công nghệ Vạn Xuân'
        },
        {
            id: 'CKP',
            text: 'Trường Cao đẳng Kỹ thuật Lý Tự Trọng'
        },
        {
            id: 'CVS',
            text: 'Trường Cao đẳng Văn hóa Nghệ thuật và Du lịch Sài Gòn'
        },
        {
            id: 'CDV',
            text: 'Trường Cao đẳng Viễn Đông'
        },
        {
            id: 'CHD',
            text: 'Trường Cao đẳng Y Dược Hồng Đức'
        },
        {
            id: 'CCA',
            text: 'Trường Cao đẳng Công nghiệp Hóa chất'
        },
        {
            id: 'CHH',
            text: 'Trường Cao đẳng Hàng Hải'
        },
        {
            id: 'DTU',
            text: 'Trường Cao đẳng Kinh tế - Kỹ thuật (Đại học Thái Nguyên)'
        },
        {
            id: 'CKA',
            text: 'Trường Cao đẳng Kinh tế Kỹ thuật Vĩnh Phúc'
        },
        {
            id: 'CCT',
            text: 'Trường Cao đẳng Kinh tế và Công nghệ Thực phẩm'
        },
        {
            id: 'CSL',
            text: 'Trường Cao đẳng Nông Lâm Sơn La'
        },
        {
            id: 'CNL',
            text: 'Trường Cao đẳng Nông Lâm Thanh Hóa'
        },
        {
            id: 'CTO',
            text: 'Trường Cao đẳng Thể dục Thể thao Thanh Hóa'
        },
        {
            id: 'CTL',
            text: 'Trường Cao đẳng Thủy lợi Bắc Bộ'
        },
        {
            id: 'CSB',
            text: 'Trường Cao đẳng Thủy sản'
        },
        {
            id: 'C23',
            text: 'Trường Cao đẳng Sư phạm Hòa Bình'
        },
        {
            id: 'C18',
            text: 'Trường Cao đẳng Ngô Gia Tự Bắc Giang'
        },
        {
            id: 'C09',
            text: 'Trường Cao đẳng Sư phạm Tuyên Quang'
        },
        {
            id: 'CVB',
            text: 'Trường Cao đẳng Văn hóa Nghệ thuật Tây Bắc'
        },
        {
            id: 'VNB',
            text: 'Trường Cao đẳng Văn hóa Nghệ thuật Thái Bình'
        },
        {
            id: 'CNV',
            text: 'Trường Cao đẳng Văn hóa Nghệ thuật Việt Bắc'
        },
        {
            id: 'CBK',
            text: 'Trường Cao đẳng Bách khoa Hưng Yên'
        },
        {
            id: 'CNC',
            text: 'Trường Cao đẳng Ngoại ngữ - Công nghệ Việt Nhật'
        },
        {
            id: 'CBH',
            text: 'Trường Cao đẳng Công nghệ Bắc Hà'
        },
        {
            id: 'CDU',
            text: 'Trường Cao đẳng Dược Phú Thọ'
        },
        {
            id: 'CSA',
            text: 'Trường Cao đẳng ASEAN'
        },
        {
            id: 'CKB',
            text: 'Trường Cao đẳng Bách khoa Đà Nẵng'
        },
        {
            id: 'CDQ',
            text: 'Trường Cao đẳng Công Kỹ nghệ Đông Á'
        },
        {
            id: 'DDC',
            text: 'Trường Cao đẳng Công nghệ (Đại học Đà Nẵng)'
        },
        {
            id: 'CEM',
            text: 'Trường Cao đẳng Công nghệ Kinh tế và Thủy lợi miền Trung'
        },
        {
            id: 'DDI',
            text: 'Trường Cao đẳng Công nghệ Thông tin (Đại học Đà Nẵng)'
        },
        {
            id: 'CHV',
            text: 'Trường Cao đẳng Công nghệ Thông tin Hữu nghị Việt Hàn'
        },
        {
            id: 'CĐ.V.274.0',
            text: 'Trường Cao đẳng Công nghệ và Kinh tế Bảo Lộc'
        },
        {
            id: 'CCP',
            text: 'Trường Cao đẳng Công nghiệp Tuy Hòa'
        },
        {
            id: 'CCZ',
            text: 'Trường Cao đẳng Đại Việt Đà Nẵng'
        },
        {
            id: 'CDD',
            text: 'Trường Cao đẳng Đông Du Đà Nẵng'
        },
        {
            id: 'CNA',
            text: 'Trường Cao đẳng Hoan Châu - Nghệ An'
        },
        {
            id: 'CEA1',
            text: 'Trường Cao đẳng Kinh tế Kỹ thuật Nghệ An'
        },
        {
            id: 'CCQ',
            text: 'Trường Cao đẳng Kỹ thuật Công nghiệp Quảng Ngãi'
        },
        {
            id: 'CLV',
            text: 'Trường Cao đẳng Lạc Việt'
        },
        {
            id: 'PIC',
            text: 'Trường Cao đẳng Quốc tế Pegasus'
        },
        {
            id: 'CDA',
            text: 'Trường Cao đẳng Tư thục Đức Trí'
        },
        {
            id: 'CPN',
            text: 'Trường Cao đẳng Tư thục Phương Đông - Đà Nẵng'
        },
        {
            id: 'CPD',
            text: 'Trường Cao đẳng Tư thục Phương Đông - Quảng Nam'
        },
        {
            id: 'CVL',
            text: 'Trường Cao đẳng Văn hóa Nghệ thuật Đắk Lắk'
        },
        {
            id: 'CĐ.IV.271.0',
            text: 'Trường Cao đẳng Y tế Khánh Hòa'
        },
        {
            id: 'YQT',
            text: 'Trường Cao đẳng Y tế Quảng Trị'
        },
        {
            id: 'BLC',
            text: 'Trường Cao đẳng Kinh tế - Kỹ thuật Bạc Liêu'
        },
        {
            id: 'LQD',
            text: 'Trường Cao đẳng Lê Quý Đôn'
        },
        {
            id: 'CT01',
            text: 'Trường Trung cấp Công nghệ Chế tạo máy'
        },
        {
            id: 'GT04',
            text: 'Trường Cán bộ Quản lý Giao thông Vận tải'
        },
        {
            id: 'GT01',
            text: 'Trường Trung cấp Giao thông Vận tải miền Bắc'
        },
        {
            id: 'YT02',
            text: 'Trường Trung cấp Y tế Đặng Văn Ngữ'
        },
        {
            id: 'VH05',
            text: 'Trường Trung cấp Nghệ thuật Xiếc và Tạp kỹ Việt Nam'
        },
        {
            id: 'QP01',
            text: 'Trường Trung cấp Cầu đường và Dạy nghề'
        },
        {
            id: 'QP021',
            text: 'Trường Trung Cấp Kỹ thuật Xe - Máy'
        },
        {
            id: 'QP04',
            text: 'Trường Trung cấp Quân Y I'
        },
        {
            id: 'TL06',
            text: 'Trường Trung cấp Nghiệp vụ Công đoàn Giao thông vận tải'
        },
        {
            id: 'TL07',
            text: 'Trường Trung cấp Công đoàn TP. Hà Nội'
        },
        {
            id: 'ND01',
            text: 'Trường Cán bộ Hội Nông dân Việt Nam'
        },
        {
            id: 'GT15',
            text: 'Trường Trung cấp Hà Nội'
        },
        {
            id: '101',
            text: 'Trường Trung cấp Bách nghệ Hà Nội'
        },
        {
            id: '151',
            text: 'Trường Trung cấp Bách khoa Hà Nội'
        },
        {
            id: '111',
            text: 'Trường Trung cấp Công nghệ Bách khoa Hà Nội'
        },
        {
            id: '103',
            text: 'Trường Trung cấp Công nghệ Hà Nội'
        },
        {
            id: '104',
            text: 'Trường Trung cấp Công nghệ Thăng Long'
        },
        {
            id: '105',
            text: 'Trường Trung cấp Công nghệ và Kinh tế Đối ngoại'
        },
        {
            id: '106',
            text: 'Trường Trung cấp Công nghệ và Quản trị Đông Đô'
        },
        {
            id: '107',
            text: 'Trường Trung cấp Công nghệ và Quản trị Kinh doanh Hà Nội'
        },
        {
            id: '108',
            text: 'Trường Trung cấp Cộng đồng Hà Nội'
        },
        {
            id: '153',
            text: 'Trường Trung cấp Công nghiệp Hà Nội'
        },
        {
            id: '109',
            text: 'Trường Trung cấp Công thương Hà Nội'
        },
        {
            id: '110',
            text: 'Trường Trung cấp Dược Hà Nội'
        },
        {
            id: '170',
            text: 'Trường Trung cấp Đa ngành Hà Nội'
        },
        {
            id: '112',
            text: 'Trường Trung cấp Kinh tế - Công nghệ Nguyễn Bỉnh Khiêm'
        },
        {
            id: '113',
            text: 'Trường Trung cấp Kinh tế Du lịch Hoa Sữa'
        },
        {
            id: '114',
            text: 'Trường Trung cấp Kinh tế Hà Nội'
        },
        {
            id: '115',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật Ba Đình'
        },
        {
            id: '116',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Bắc Thăng Long'
        },
        {
            id: '117',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Công nghệ Hà Nội'
        },
        {
            id: '152',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Đa ngành Sóc Sơn'
        },
        {
            id: '118',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Đông Á'
        },
        {
            id: '119',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật Hà Nội I'
        },
        {
            id: '120',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Phan Chu Trinh'
        },
        {
            id: '121',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Quang Trung'
        },
        {
            id: '123',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Thăng Long'
        },
        {
            id: '122',
            text: 'Trường Trung cấp Giao thông Vận tải Hà Nội'
        },
        {
            id: '124',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Thương mại'
        },
        {
            id: '102',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật Thương mại Hà Nội'
        },
        {
            id: '125',
            text: 'Trường Trung cấp Kinh tế - Tài chính Hà Nội'
        },
        {
            id: '126',
            text: 'Trường Trung cấp Kinh tế - Tài nguyên và Môi Trường'
        },
        {
            id: '127',
            text: 'Trường Trung cấp Kỹ thuật Đa ngành Hà Nội'
        },
        {
            id: '155',
            text: 'Trường Trung cấp Kỹ thuật Công nghệ Lê Quý Đôn'
        },
        {
            id: '128',
            text: 'Trường Trung cấp Kỹ thuật Tin học Hà Nội'
        },
        {
            id: '129',
            text: 'Trường Trung cấp Kỹ thuật Y - Dược Hà Nội'
        },
        {
            id: '130',
            text: 'Trường Cao đẳng Công nghệ và Môi Trường'
        },
        {
            id: '131',
            text: 'Trường Trung cấp Sư phạm Mẫu giáo Nhà trẻ Hà Nội'
        },
        {
            id: '158',
            text: 'Trường Trung cấp Tài chính Hà Nội'
        },
        {
            id: '156',
            text: 'Trường Trung cấp Thông tin Truyền thông Hà Nội'
        },
        {
            id: '132',
            text: 'Trường Trung cấp Tin học - Tài chính Kế toán Hà Nội'
        },
        {
            id: '133',
            text: 'Trường Trung cấp Tổng hợp Hà Nội'
        },
        {
            id: '134',
            text: 'Trường Trung cấp Xây dựng Hà Nội'
        },
        {
            id: '159',
            text: 'Trường Trung cấp Y Dược Bảo Long Hà Nội'
        },
        {
            id: '135',
            text: 'Trường Trung cấp Y Dược Hà Nội'
        },
        {
            id: '136',
            text: 'Trường Trung cấp Y Dược Lê Hữu Trác'
        },
        {
            id: '137',
            text: 'Trường Trung cấp Y Dược Phạm Ngọc Thạch'
        },
        {
            id: '138',
            text: 'Trường Trung cấp Y Dược Tuệ Tĩnh Hà Nội'
        },
        {
            id: '150',
            text: 'Trường Trung cấp Y Hà Nội'
        },
        {
            id: '139',
            text: 'Trường Trung cấp Y khoa Hà Nội'
        },
        {
            id: '157',
            text: 'Trường Trung cấp Y tế Hà Nội'
        },
        {
            id: '140',
            text: 'Trường Đào tạo cán bộ Lê Hồng Phong'
        },
        {
            id: 'NN01',
            text: 'Trường Trung cấp Công nghệ Lương thực Thực phẩm'
        },
        {
            id: 'NN04',
            text: 'Trường Trung cấp Thủy sản'
        },
        {
            id: 'YT12',
            text: 'Viện Vệ sinh Y tế công cộng TP. Hồ Chí Minh'
        },
        {
            id: 'NV1A',
            text: 'Trường Trung cấp Văn thư lưu trữ Trung ương'
        },
        {
            id: 'VH04',
            text: 'Trường Trung cấp Múa TP. Hồ Chí Minh'
        },
        {
            id: 'GD20',
            text: 'Trường Cao đẳng Kinh Tế - Kỹ Thuật Sài Gòn'
        },
        {
            id: 'QP02',
            text: 'Trường Trung cấp Kỹ thuật Hải Quân'
        },
        {
            id: 'QP05',
            text: 'Trường Trung cấp Quân Y II'
        },
        {
            id: 'TL04',
            text: 'Trường Trung cấp Chuyên nghiệp Tôn Đức Thắng'
        },
        {
            id: 'TL08',
            text: 'Trường Trung cấp Công đoàn TP. Hồ Chí MInh'
        },
        {
            id: '201',
            text: 'Trường Trung cấp Ánh Sáng'
        },
        {
            id: '202',
            text: 'Trường Trung cấp Âu Việt'
        },
        {
            id: '220',
            text: 'Trường Trung cấp Bách khoa Sài Gòn'
        },
        {
            id: '240',
            text: 'Trường Trung cấp Bến Thành'
        },
        {
            id: '204',
            text: 'Trường Trung cấp Công nghệ Thông tin Sài Gòn'
        },
        {
            id: '205',
            text: 'Trường Trung cấp Du lịch và Khách sạn Saigontourist'
        },
        {
            id: '207',
            text: 'Trường Trung cấp Đại Việt'
        },
        {
            id: '208',
            text: 'Trường Trung cấp Hồng Hà'
        },
        {
            id: '224',
            text: 'Trường Trung cấp Nguyễn Tất Thành'
        },
        {
            id: '242',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật Hóc Môn'
        },
        {
            id: '209',
            text: 'Trường Trung cấp Quang Trung'
        },
        {
            id: '210',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật Nguyễn Hữu Cảnh'
        },
        {
            id: '211',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật Sài Gòn'
        },
        {
            id: '212',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật Tây Nam Á'
        },
        {
            id: '243',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật Quận 12'
        },
        {
            id: '213',
            text: 'Trường Trung cấp Kỹ thuật Nông nghiệp TP. Hồ Chí Minh'
        },
        {
            id: '214',
            text: 'Trường Trung cấp Kỹ thuật và Công nghệ Cửu Long'
        },
        {
            id: '215',
            text: 'Trường Trung cấp Kỹ thuật và Nghiệp vụ Nam Sài Gòn'
        },
        {
            id: '216',
            text: 'Trường Trung cấp Mai Linh'
        },
        {
            id: '217',
            text: 'Trường Trung cấp Phương Đông'
        },
        {
            id: '218',
            text: 'Trường Trung cấp Phương Nam'
        },
        {
            id: '219',
            text: 'Trường Trung cấp Tài chính Kế toán Tin học Sài Gòn'
        },
        {
            id: '221',
            text: 'Trường Trung cấp Tây Sài Gòn'
        },
        {
            id: '222',
            text: 'Trường Trung cấp Tin học Kinh tế Sài Gòn'
        },
        {
            id: '241',
            text: 'Trường Trung cấp Thông tin - Truyền thông TP. HCM'
        },
        {
            id: '225',
            text: 'Trường Trung cấp Kinh tế và Du lịch TP. Hồ Chí Minh'
        },
        {
            id: '227',
            text: 'Trường Trung cấp Tổng hợp Đông Nam Á'
        },
        {
            id: '226',
            text: 'Trường Trung cấp Tổng hợp TP. Hồ Chí Minh'
        },
        {
            id: '228',
            text: 'Trường Trung cấp Vạn Tường'
        },
        {
            id: '229',
            text: 'Trường Trung cấp Việt Khoa'
        },
        {
            id: '244',
            text: 'Trường Trung cấp Y Dược Vạn Hạnh'
        },
        {
            id: '231',
            text: 'Trường Cán bộ TP. Hồ Chí Minh'
        },
        {
            id: 'HTC0020',
            text: 'Trường Cao đẳng nghề Thủy Sản miền Bắc'
        },
        {
            id: 'HTC0024',
            text: 'Trường Cao đẳng Tài chính Quản trị kinh doanh'
        },
        {
            id: 'HTC0028',
            text: 'Trường Trung cấp Kỹ thuật - Nghiệp vụ Hải Phòng'
        },
        {
            id: 'HTC0029',
            text: 'Trường Trung cấp Kỹ thuật - Nghiệp vụ Sông Hồng'
        },
        {
            id: 'HTC0030',
            text: 'Trường Trung cấp Xây dựng'
        },
        {
            id: 'HTC0031',
            text: 'Trường Trung cấp Xây dựng số 4'
        },
        {
            id: 'HTC0032',
            text: 'Trường Trung cấp Xây dựng Thanh Hóa'
        },
        {
            id: 'HTC0047',
            text: 'Trường Trung cấp Bưu chính Viễn thông và Công nghệ thông tin I'
        },
        {
            id: 'HTC0048',
            text: 'Trường Trung cấp Bưu chính Viễn thông và Công nghệ thông tin miền núi'
        },
        {
            id: 'HTC0049',
            text: 'Trường Trung cấp Luật Thái Nguyên'
        },
        {
            id: 'HTC0050',
            text: 'Trường Trung cấp Luật Tây Bắc'
        },
        {
            id: 'HTC0051',
            text: 'Trường Trung cấp Công đoàn Nam Định'
        },
        {
            id: 'HTC0052',
            text: 'Trường Trung cấp Bách khoa Hải Phòng'
        },
        {
            id: 'HTC0053',
            text: 'Trường Trung cấp Chuyên nghiệp Hải Phòng'
        },
        {
            id: 'HTC0054',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật Hải Phòng'
        },
        {
            id: 'HTC0055',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật và Công nghệ Hải Phòng'
        },
        {
            id: 'HTC0056',
            text: 'Trường Trung cấp Nghiệp vụ và Công nghệ Hải Phòng'
        },
        {
            id: 'HTC0057',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật Hải Phòng'
        },
        {
            id: 'HTC0060',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Hà Giang'
        },
        {
            id: 'HTC0061',
            text: 'Trường Trung cấp Y tế Hà Giang'
        },
        {
            id: 'HTC0062',
            text: 'Trường Chính trị tỉnh Hà Giang'
        },
        {
            id: 'HTC0064',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật Cao Bằng'
        },
        {
            id: 'HTC0065',
            text: 'Trường Trung cấp Y tế Cao Bằng'
        },
        {
            id: 'HTC0070',
            text: 'Trường Trung cấp Y tế Lai Châu'
        },
        {
            id: 'HTC0072',
            text: 'Trường Trung cấp Y tế Lào Cai'
        },
        {
            id: 'HTC0073',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật và Du lịch Lào Cai'
        },
        {
            id: 'HTC0076',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật Tuyên Quang'
        },
        {
            id: 'HTC0077',
            text: 'Trường Trung cấp Y tế Tuyên Quang'
        },
        {
            id: 'HTC0078',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật Lạng Sơn'
        },
        {
            id: 'HTC0079',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật Lạng Sơn'
        },
        {
            id: 'HTC0082',
            text: 'Trường Chính trị Hoàng Văn Thụ tỉnh Lạng Sơn'
        },
        {
            id: 'HTC0083',
            text: 'Trường Trung cấp Y tế Bắc Kạn'
        },
        {
            id: 'HTC0085',
            text: 'Trường Trung cấp Thái Nguyên'
        },
        {
            id: 'HTC0086',
            text: 'Trường Trung cấp Y khoa Pasteur'
        },
        {
            id: 'HTC0087',
            text: 'Trường Trung cấp Y tế Thái Nguyên'
        },
        {
            id: 'HTC0091',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Yên Bái'
        },
        {
            id: 'HTC0092',
            text: 'Trường Trung cấp Thể dục - Thể thao Yên Bái'
        },
        {
            id: 'HTC0097',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật và Du lịch Sơn La'
        },
        {
            id: 'HTC0100',
            text: 'Trường Trung cấp Nông Lâm nghiệp Phú Thọ'
        },
        {
            id: 'HTC0101',
            text: 'Trường Trung cấp Văn hoá Nghệ thuật Phú Thọ'
        },
        {
            id: 'HTC0104',
            text: 'Trường Trung cấp Kinh tế Quảng Ninh'
        },
        {
            id: 'HTC0107',
            text: 'Trường Trung cấp Asean'
        },
        {
            id: 'HTC0108',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Bắc Giang'
        },
        {
            id: 'HTC0109',
            text: 'Trường Trung cấp Văn hóa Thể thao và Du lịch Bắc Giang'
        },
        {
            id: 'HTC0110',
            text: 'Trường Trung cấp Y tế Bắc Giang'
        },
        {
            id: 'HTC0111',
            text: 'Trường Trung cấp Y Dược Bắc Giang'
        },
        {
            id: 'HTC0113',
            text: 'Trường Cao đẳng Kinh tế - Kỹ thuật Hoà Bình'
        },
        {
            id: 'HTC0114',
            text: 'Trường Trung cấp Y tế Hoà Bình'
        },
        {
            id: 'HTC0116',
            text: 'Trường Trung cấp Công nghệ Vĩnh Phúc'
        },
        {
            id: 'HTC0117',
            text: 'Trường Trung cấp Kinh doanh và Quản lý Tâm Tín'
        },
        {
            id: 'HTC0118',
            text: 'Trường Trung cấp Kỹ thuật Vĩnh Phúc'
        },
        {
            id: 'HTC0119',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật Vĩnh Phúc'
        },
        {
            id: 'HTC0120',
            text: 'Trường Trung cấp Y tế Vĩnh Phúc'
        },
        {
            id: 'HTC0123',
            text: 'Trường Trung cấp Y Dược Thăng Long'
        },
        {
            id: 'HTC0124',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Á Châu'
        },
        {
            id: 'HTC0125',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Công thương - CCI'
        },
        {
            id: 'HTC0126',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Dược Tuệ Tĩnh'
        },
        {
            id: 'HTC0127',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Thương mại số 1'
        },
        {
            id: 'HTC0128',
            text: 'Trường Trung cấp Văn hoá Nghệ thuật và Du lịch Bắc Ninh'
        },
        {
            id: 'HTC0129',
            text: 'Trường Trung cấp Y tế Trung ương'
        },
        {
            id: 'HTC0130',
            text: 'Trường Trung cấp Y tế Bắc Ninh'
        },
        {
            id: 'HTC0131',
            text: 'Trường Trung cấp Y Dược Bạch Mai'
        },
        {
            id: 'HTC0133',
            text: 'Trường Trung cấp Kỹ thuật - Công nghệ Hải Dương'
        },
        {
            id: 'HTC0134',
            text: 'Trường Trung cấp Nông nghiệp và Phát triển nông thôn Hải Dương'
        },
        {
            id: 'HTC0135',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật và Du lịch Hải Dương'
        },
        {
            id: 'HTC0136',
            text: 'Trường Trung cấp Y tế Hải Dương'
        },
        {
            id: 'HTC0138',
            text: 'Trường Trung cấp Tổng hợp Đông Đô'
        },
        {
            id: 'HTC0139',
            text: 'Trường Trung cấp Công nghệ và Kinh tế Việt - Hàn'
        },
        {
            id: 'HTC0141',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật và Du lịch Hưng Yên'
        },
        {
            id: 'HTC0144',
            text: 'Trường Trung cấp Y Dược Hà Nam'
        },
        {
            id: 'HTC0145',
            text: 'Trường Chính trị tỉnh Hà Nam'
        },
        {
            id: 'HTC0148',
            text: 'Trường Trung cấp Cơ điện Nam Định'
        },
        {
            id: 'HTC0149',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Nam Định'
        },
        {
            id: 'HTC0150',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật Nông nghiệp Nam Định'
        },
        {
            id: 'HTC0151',
            text: 'Trường Trung cấp Công nghệ và Truyền thông Nam Định'
        },
        {
            id: 'HTC0152',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật Nam Định'
        },
        {
            id: 'HTC0153',
            text: 'Trường Trung cấp Y tế Nam Định'
        },
        {
            id: 'HTC0156',
            text: 'Trường Chính trị Trường Chinh Nam Định'
        },
        {
            id: 'HTC0157',
            text: 'Trường Trung cấp Nông nghiệp Thái Bình'
        },
        {
            id: 'HTC0158',
            text: 'Trường Trung cấp Sư phạm Mầm non'
        },
        {
            id: 'HTC0159',
            text: 'Trường Trung cấp Xây dựng Thái Bình'
        },
        {
            id: 'HTC0160',
            text: 'Trường Chính trị Thái Bình'
        },
        {
            id: 'HTC0164',
            text: 'Trường Trung cấp Công nghệ và Y tế Pasteur'
        },
        {
            id: 'HTC0165',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật và Tại chức Ninh Bình'
        },
        {
            id: 'HTC0166',
            text: 'Trường Trung cấp Y Dược Tôn Thất Tùng'
        },
        {
            id: 'HTC0168',
            text: 'Trường Trung cấp Bách nghệ Thanh Hoá'
        },
        {
            id: 'HTC0169',
            text: 'Trường Trung cấp Kỹ thuật Y Dược Thanh Hóa'
        },
        {
            id: 'HTC0170',
            text: 'Trường Trung cấp Đức Thiện'
        },
        {
            id: 'HTC0171',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật VISTCO'
        },
        {
            id: 'HTC0173',
            text: 'Trường Cao đẳng nghề Nông nghiệp và PTNT Thanh Hoá'
        },
        {
            id: 'HTC0174',
            text: 'Trường Trung cấp Tuệ Tĩnh Thanh Hóa'
        },
        {
            id: 'HTC0175',
            text: 'Trường Trung cấp Văn Hiến'
        },
        {
            id: 'HTC0176',
            text: 'Trường Trung cấp Y - Dược Hợp Lực'
        },
        {
            id: 'HTC0177',
            text: 'Trường Chính trị tỉnh Thanh Hóa'
        },
        {
            id: 'HTC0184',
            text: 'Trường Trung cấp Lâm nghiệp Tây Nguyên'
        },
        {
            id: 'HTC0190',
            text: 'Trường Trung cấp Kỹ thuật và Nghiệp vụ Vinh'
        },
        {
            id: 'HTC0191',
            text: 'Trường Trung cấp Xây dựng miền Trung'
        },
        {
            id: 'HTC0192',
            text: 'Trường Cao Đẳng Kỹ thuật Y tế II'
        },
        {
            id: 'HTC0193',
            text: 'Viện Pasteur Nha Trang'
        },
        {
            id: 'HTC0194',
            text: 'Viện Sốt rét - Ký sinh trùng - Côn trùng Quy Nhơn'
        },
        {
            id: 'HTC0196',
            text: 'Trường Trung cấp Văn thư lưu trữ Trung ương (Phân hiệu Đà Lạt)'
        },
        {
            id: 'HTC0202',
            text: 'Trường Cao đẳng Công nghệ và Kinh doanh Việt Tiến'
        },
        {
            id: 'HTC0203',
            text: 'Trường Cao đẳng Đức Trí'
        },
        {
            id: 'HTC0205',
            text: 'Trường Cao đẳng Kinh tế - Kỹ thuật Đông Du Đà Nẵng'
        },
        {
            id: 'HTC0208',
            text: 'Trường Cao đẳng Phương Đông - Đà Nẵng'
        },
        {
            id: 'HTC0209',
            text: 'Trường Cao đẳng Phương Đông - Quảng Nam'
        },
        {
            id: 'HTC0213',
            text: 'Trường Trung cấp Luật Buôn Ma Thuột'
        },
        {
            id: 'HTC0214',
            text: 'Trường Trung cấp Luật Đồng Hới'
        },
        {
            id: 'HTC0215',
            text: 'Trường Trung cấp Bưu chính Viễn thông và Công nghệ thông tin II'
        },
        {
            id: 'HTC0217',
            text: 'Trường Trung cấp Chuyên nghiệp Nha Trang'
        },
        {
            id: 'HTC0218',
            text: 'Trường Trung cấp Du lịch miền Trung'
        },
        {
            id: 'HTC0219',
            text: 'Trường Trung cấp Việt - Anh'
        },
        {
            id: 'HTC0220',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật Hồng Lam'
        },
        {
            id: 'HTC0221',
            text: 'Trường Trung cấp Y khoa miền Trung'
        },
        {
            id: 'HTC0222',
            text: 'Trường Trung cấp Việt - Úc'
        },
        {
            id: 'HTC0225',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Hà Tĩnh'
        },
        {
            id: 'HTC0226',
            text: 'Trường Trung cấp Kỹ thuật Nông nghiệp và Phát triển nông thôn Hà Tĩnh'
        },
        {
            id: 'HTC0229',
            text: 'Trường Trung cấp Kinh tế Quảng Bình'
        },
        {
            id: 'HTC0230',
            text: 'Trường Trung cấp Kỹ thuật Công Nông nghiệp Quảng Bình'
        },
        {
            id: 'HTC0231',
            text: 'Trường Trung cấp Y tế Quảng Bình'
        },
        {
            id: 'HTC0232',
            text: 'Trường Trung cấp Mai Lĩnh Quảng Trị'
        },
        {
            id: 'HTC0233',
            text: 'Trường Trung cấp Nông nghiệp và Phát triển nông thôn Quảng Trị'
        },
        {
            id: 'HTC0235',
            text: 'Trường Trung cấp Bùi Dục Tài'
        },
        {
            id: 'HTC0237',
            text: 'Trường Trung cấp Âu Lạc - Huế'
        },
        {
            id: 'HTC0238',
            text: 'Trường Trung cấp Giao thông Vận tải Huế'
        },
        {
            id: 'HTC0239',
            text: 'Trường Trung cấp Kinh tế - Du lịch Duy Tân'
        },
        {
            id: 'HTC0240',
            text: 'Trường Trung cấp Thể dục Thể thao Huế'
        },
        {
            id: 'HTC0241',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật Thừa Thiên Huế'
        },
        {
            id: 'HTC0244',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Đức Minh'
        },
        {
            id: 'HTC0245',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật miền Trung'
        },
        {
            id: 'HTC0246',
            text: 'Trường Trung cấp Kỹ thuật - Nghiệp vụ Thăng Long'
        },
        {
            id: 'HTC0247',
            text: 'Trường Trung cấp Kỹ thuật - Nghiệp vụ Việt Á'
        },
        {
            id: 'HTC0248',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật Đà Nẵng'
        },
        {
            id: 'HTC0249',
            text: 'Trường Trung cấp Chuyên nghiệp Ý Việt'
        },
        {
            id: 'HTC0250',
            text: 'Trường Trung cấp Bách khoa Quảng Nam'
        },
        {
            id: 'HTC0251',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Quảng Đông, Tỉnh Quảng Nam'
        },
        {
            id: 'HTC0252',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật và Du lịch Quảng Nam'
        },
        {
            id: 'HTC0256',
            text: 'Trường Chính trị tỉnh Quảng Ngãi'
        },
        {
            id: 'HTC0257',
            text: 'Trường Trung cấp Y tế Kon Tum'
        },
        {
            id: 'HTC0260',
            text: 'Trường Trung cấp Kinh tế kỹ thuật Bình Định'
        },
        {
            id: 'HTC0261',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật Bình Định'
        },
        {
            id: 'HTC0264',
            text: 'Trường Trung cấp Văn hóa - Nghệ thuật Gia Lai'
        },
        {
            id: 'HTC0265',
            text: 'Trường Trung cấp Y tế Gia Lai'
        },
        {
            id: 'HTC0267',
            text: 'Trường Trung cấp Y tế Phú Yên'
        },
        {
            id: 'HTC0268',
            text: 'Trường Trung cấp Đắk Lắk'
        },
        {
            id: 'HTC0269',
            text: 'Trường Trung cấp Đam San'
        },
        {
            id: 'HTC0270',
            text: 'Trường Trung cấp Kinh tế Công nghệ Tây Nguyên'
        },
        {
            id: 'HTC0271',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Đắk Lắk'
        },
        {
            id: 'HTC0272',
            text: 'Trường Trung cấp Sư phạm Mầm non Đắk Lắk'
        },
        {
            id: 'HTC0273',
            text: 'Trường Trung cấp Trường Sơn'
        },
        {
            id: 'HTC0274',
            text: 'Trường Trung cấp Y tế Đắk Lắk'
        },
        {
            id: 'HTC0276',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Phương Nam'
        },
        {
            id: 'HTC0277',
            text: 'Trường Trung cấp Kinh tế Khánh Hòa'
        },
        {
            id: 'HTC0278',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Trần Đại Nghĩa'
        },
        {
            id: 'HTC0282',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Quốc Việt'
        },
        {
            id: 'HTC0286',
            text: 'Trường Chính trị Lâm Đồng'
        },
        {
            id: 'HTC0287',
            text: 'Trường Trung cấp Việt Thuận'
        },
        {
            id: 'HTC0289',
            text: 'Trường Trung cấp Y tế Ninh Thuận'
        },
        {
            id: 'HTC0290',
            text: 'Trường Trung cấp Du lịch Mũi Né'
        },
        {
            id: 'HTC0297',
            text: 'Trường Trung cấp Giao thông Vận tải miền Nam'
        },
        {
            id: 'HTC0298',
            text: 'Trường Trung cấp Thống kê'
        },
        {
            id: 'HTC0302',
            text: 'Trường Trung cấp Bưu chính Viễn thông và Công nghệ thông tin III'
        },
        {
            id: 'HTC0303',
            text: 'Trường Trung cấp Luật Vị Thanh'
        },
        {
            id: 'HTC0304',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Bình Phước'
        },
        {
            id: 'HTC0305',
            text: 'Trường Trung cấp Y tế Bình Phước'
        },
        {
            id: 'HTC0307',
            text: 'Trường Trung cấp Bách khoa Bình Dương'
        },
        {
            id: 'HTC0308',
            text: 'Trường Trung cấp Công nghiệp Bình Dương'
        },
        {
            id: 'HTC0309',
            text: 'Trường Trung cấp Kinh tế Bình Dương'
        },
        {
            id: 'HTC0310',
            text: 'Trường Trung cấp Kinh tế Công nghệ Đông Nam'
        },
        {
            id: 'HTC0311',
            text: 'Trường Trung cấp Kỹ thuật Phú Giáo'
        },
        {
            id: 'HTC0312',
            text: 'Trường Trung cấp Mỹ thuật Bình Dương'
        },
        {
            id: 'HTC0313',
            text: 'Trường Trung cấp Nông Lâm nghiệp'
        },
        {
            id: 'HTC0314',
            text: 'Trường Trung cấp Tài chính - Kế toán Bình Dương'
        },
        {
            id: 'HTC0315',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật và Du lịch Bình Dương'
        },
        {
            id: 'HTC0317',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Tân Bách khoa'
        },
        {
            id: 'HTC0318',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Tây Ninh'
        },
        {
            id: 'HTC0319',
            text: 'Trường Trung cấp Y tế Tây Ninh'
        },
        {
            id: 'HTC0321',
            text: 'Trường Trung cấp Miền Đông'
        },
        {
            id: 'HTC0322',
            text: 'Trường Trung cấp Bách khoa Đồng Nai'
        },
        {
            id: 'HTC0323',
            text: 'Trường Trung cấp Kinh tế Đồng Nai'
        },
        {
            id: 'HTC0324',
            text: 'Trường Trung cấp Kỹ thuật Công nghiệp Đồng Nai'
        },
        {
            id: 'HTC0325',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Đồng Nai'
        },
        {
            id: 'HTC0326',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật Đồng Nai'
        },
        {
            id: 'HTC0328',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Long An'
        },
        {
            id: 'HTC0329',
            text: 'Trường Trung cấp Y tế Long An'
        },
        {
            id: 'HTC0330',
            text: 'Trường Trung cấp Việt Nhật'
        },
        {
            id: 'HTC0331',
            text: 'Trường Chính trị Long An'
        },
        {
            id: 'HTC0335',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật An Giang'
        },
        {
            id: 'HTC0336',
            text: 'Trường Trung cấp Y tế An Giang'
        },
        {
            id: 'HTC0338',
            text: 'Trường Trung cấp Chuyên nghiệp Bà Rịa'
        },
        {
            id: 'HTC0339',
            text: 'Trường Trung cấp Y tế Bà Rịa - Vũng Tàu'
        },
        {
            id: 'HTC0342',
            text: 'Trường Trung cấp Bách khoa Gò Công'
        },
        {
            id: 'HTC0343',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Tiền Giang'
        },
        {
            id: 'HTC0344',
            text: 'Trường Trung cấp Kỹ thuật - Nghiệp vụ Cái Bè'
        },
        {
            id: 'HTC0345',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật Tiền Giang'
        },
        {
            id: 'HTC0347',
            text: 'Trường Trung cấp Kinh tế Công nghệ Cai Lậy'
        },
        {
            id: 'HTC0348',
            text: 'Trường Trung cấp Kỹ thuật - Nghiệp vụ Kiên Giang'
        },
        {
            id: 'HTC0353',
            text: 'Trường Chính trị Kiên Giang'
        },
        {
            id: 'HTC0354',
            text: 'Trường Trung cấp Bách nghệ Cần Thơ'
        },
        {
            id: 'HTC0355',
            text: 'Trường Trung cấp Đại Việt TP. Cần Thơ'
        },
        {
            id: 'HTC0356',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Cần Thơ'
        },
        {
            id: 'HTC0357',
            text: 'Trường Trung cấp Hồng Hà Cần Thơ'
        },
        {
            id: 'HTC0358',
            text: 'Trường Trung cấp Miền Tây'
        },
        {
            id: 'HTC0359',
            text: 'Trường Trung cấp Phạm Ngọc Thạch'
        },
        {
            id: 'HTC0360',
            text: 'Trường Trung cấp Thể dục Thể thao'
        },
        {
            id: 'HTC0361',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật Cần Thơ'
        },
        {
            id: 'HTC0362',
            text: 'Trường Trung cấp Y Dược MeKong'
        },
        {
            id: 'HTC0366',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật Bến Tre'
        },
        {
            id: 'HTC0367',
            text: 'Trường Trung cấp Y tế Bến Tre'
        },
        {
            id: 'HTC0369',
            text: 'Trường Trung cấp Kinh tế Kỹ thuật Tân Bách khoa Cửu Long'
        },
        {
            id: 'HTC0371',
            text: 'Trường Chính trị Phạm Hùng tỉnh Vĩnh Long'
        },
        {
            id: 'HTC0375',
            text: 'Trường Trung cấp Văn hoá Nghệ thuật Trà Vinh'
        },
        {
            id: 'HTC0377',
            text: 'Trường Trung cấp Văn hóa Nghệ thuật Sóc Trăng'
        },
        {
            id: 'HTC0378',
            text: 'Trường Trung cấp Y tế Sóc Trăng'
        },
        {
            id: 'HTC0382',
            text: 'Trường Trung cấp Văn hóa - Nghệ thuật Bạc Liêu'
        },
        {
            id: 'HTC0384',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật Cà Mau'
        },
        {
            id: 'HTC0385',
            text: 'Trường Trung cấp Văn hóa Thể thao và Du lịch Cà Mau'
        },
        {
            id: 'HTC0386',
            text: 'Trường Chính trị tỉnh Cà Mau'
        },
        {
            id: 'HTC0389',
            text: 'Trường Trung cấp Kinh tế - Kỹ thuật'
        },
        {
            id: 'HTC0407',
            text: 'Trường Đại học Hùng Vương (Phú Thọ)'
        },
        {
            id: 'HTC0411',
            text: 'Trường Đại học Lao động Xã hội (Cơ sở Sơn Tây)'
        },
        {
            id: 'CDD1001',
            text: 'Trường Cao đẳng nghề An ninh - Công nghệ'
        },
        {
            id: 'CDD1002',
            text: 'Trường Cao đẳng nghề Bách Khoa'
        },
        {
            id: 'CDD1003',
            text: 'Trường Cao đẳng nghề Bách khoa Hà Nội'
        },
        {
            id: 'CDD1004',
            text: 'Trường Cao đẳng nghề Công nghệ cao Hà Nội'
        },
        {
            id: 'CDD1005',
            text: 'Trường Cao đẳng nghề Công nghệ và Kinh tế Hà Nội'
        },
        {
            id: 'CDD1006',
            text: 'Trường Cao đẳng nghề Công nghiệp Hà Nội'
        },
        {
            id: 'CDD1008',
            text: 'Trường Cao đẳng nghề Cơ Điện Hà Nội'
        },
        {
            id: 'CDD1009',
            text: 'Trường Cao đẳng nghề Cơ Điện và Công nghệ thực phẩm Hà Nội'
        },
        {
            id: 'CDD1010',
            text: 'Trường Cao đẳng nghề Điện'
        },
        {
            id: 'CDD1011',
            text: 'Trường Cao đẳng nghề Đường sắt'
        },
        {
            id: 'CDD1012',
            text: 'Trường Cao đẳng nghề FPT (FPT Polytechnic)'
        },
        {
            id: 'CDD1013',
            text: 'Trường Cao đẳng nghề Giao thông vận tải Trung ương I'
        },
        {
            id: 'CDD1014',
            text: 'Trường Cao đẳng nghề Hùng Vương'
        },
        {
            id: 'CDD1015',
            text: 'Trường Cao đẳng nghề Kinh doanh và Công nghệ Hà Nội'
        },
        {
            id: 'CDD1016',
            text: 'Trường Cao đẳng nghề Kỹ thuật Công nghệ'
        },
        {
            id: 'CDD1017',
            text: 'Trường Cao đẳng nghề Kỹ thuật - Công nghệ - Kinh tế Simco Sông Đà'
        },
        {
            id: 'CDD1018',
            text: 'Trường Cao đẳng nghề Kỹ thuật - Mỹ nghệ Việt Nam'
        },
        {
            id: 'CDD1019',
            text: 'Trường Cao đẳng nghề Kỹ thuật Thiết bị Y tế'
        },
        {
            id: 'CDD1020',
            text: 'Trường Cao đẳng nghề Kỹ thuật và Nghiệp vụ Hà Nội'
        },
        {
            id: 'CDD1021',
            text: 'Trường Cao đẳng nghề Long Biên'
        },
        {
            id: 'CDD1022',
            text: 'Trường Cao đẳng nghề Phú Châu'
        },
        {
            id: 'CDD1023',
            text: 'Trường Cao đẳng nghề Quốc tế Hà Nội'
        },
        {
            id: 'CDD1024',
            text: 'Trường Cao đẳng nghề số 17 - Bộ Quốc phòng'
        },
        {
            id: 'CDD1025',
            text: 'Trường Cao đẳng nghề Thăng Long'
        },
        {
            id: 'CDD1026',
            text: 'Trường Cao đẳng nghề Thiết kế thời trang LONDON'
        },
        {
            id: 'CDD1027',
            text: 'Trường Cao đẳng nghề Trần Hưng Đạo'
        },
        {
            id: 'CDD1028',
            text: 'Trường Cao đẳng nghề Văn Lang Hà Nội'
        },
        {
            id: 'CDD1029',
            text: 'Trường Cao đẳng nghề Việt Nam - Hàn Quốc thành phố Hà Nội'
        },
        {
            id: 'CDD1101',
            text: 'Trường Cao đẳng nghề Công nghệ thông tin iSPACE'
        },
        {
            id: 'CDD1102',
            text: 'Trường Cao đẳng nghề Du lịch Sài Gòn'
        },
        {
            id: 'CDD1103',
            text: 'Trường Cao đẳng nghề Giao thông vận tải đường thủy II'
        },
        {
            id: 'CDD1104',
            text: 'Trường Cao đẳng nghề Giao thông vận tải Trung ương III'
        },
        {
            id: 'CDD1105',
            text: 'Trường Cao đẳng nghề Hàng Hải TP. Hồ Chí Minh'
        },
        {
            id: 'CDD1106',
            text: 'Trường Cao đẳng nghề Kinh tế Công nghệ TP. Hồ Chí Minh'
        },
        {
            id: 'CDD1107',
            text: 'Trường Cao đẳng nghề Kỹ thuật Công nghệ TP. Hồ Chí Minh'
        },
        {
            id: 'CDD1108',
            text: 'Trường Cao đẳng nghề Nguyễn Trường Tộ'
        },
        {
            id: 'CDD1109',
            text: 'Trường Cao đẳng nghề Sài Gòn'
        },
        {
            id: 'CDD1110',
            text: 'Trường Cao đẳng nghề số 7 - Bộ Quốc phòng'
        },
        {
            id: 'CDD1111',
            text: 'Trường Cao đẳng nghề Thành phố Hồ Chí Minh'
        },
        {
            id: 'CDD1112',
            text: 'Trường Cao đẳng nghề Thủ Đức'
        },
        {
            id: 'CDD1113',
            text: 'Trường Cao đẳng nghề Thủ Thiêm'
        },
        {
            id: 'CDD1114',
            text: 'Trường Cao đẳng nghề Việt Mỹ'
        },
        {
            id: 'CDD1601',
            text: 'Trường Cao đẳng nghề Vĩnh Phúc'
        },
        {
            id: 'CDT1602',
            text: 'Trường Cao đẳng nghề Cơ khí nông nghiệp'
        },
        {
            id: 'CDT1603',
            text: 'Trường Cao đẳng nghề Việt Xô số 1'
        },
        {
            id: 'CDT1604',
            text: 'Trường Cao đẳng nghề Số 2 - Bộ Quốc phòng'
        },
        {
            id: 'CDT1901',
            text: 'Trường Cao đẳng nghề Cơ điện và Xây dựng Bắc Ninh'
        },
        {
            id: 'CDD1902',
            text: 'Trường Cao đẳng nghề Kinh tế - Kỹ thuật Bắc Ninh'
        },
        {
            id: 'CDD1903',
            text: 'Trường Cao đẳng nghề Quản lý và Công nghệ'
        },
        {
            id: 'CDT0116',
            text: 'Trường Cao đẳng nghề Viglacera'
        },
        {
            id: 'CDD2101',
            text: 'Trường Cao đẳng nghề Hải Dương'
        },
        {
            id: 'CDT2102',
            text: 'Trường Cao đẳng nghề Thương mại và Công nghiệp'
        },
        {
            id: 'CDT2103',
            text: 'Trường Cao đẳng nghề LICOGI'
        },
        {
            id: 'CDT2104',
            text: 'Trường Cao đẳng nghề Giao thông vận tải Đường thủy I'
        },
        {
            id: 'CDD2105',
            text: 'Trường Cao đẳng nghề Đại An'
        },
        {
            id: 'CDD0301',
            text: 'Trường Cao đẳng nghề Duyên Hải'
        },
        {
            id: 'CDT0302',
            text: 'Trường Cao đẳng nghề Giao thông vận tải trung ương II'
        },
        {
            id: 'CDT0303',
            text: 'Trường Cao đẳng nghề số 3 - Bộ Quốc phòng'
        },
        {
            id: 'CDD0304',
            text: 'Trường Cao đẳng nghề Công nghiệp Hải Phòng'
        },
        {
            id: 'CDD0305',
            text: 'Trường Cao đẳng nghề Bách nghệ Hải Phòng'
        },
        {
            id: 'CDD0306',
            text: 'Trường Cao đẳng nghề Bắc Nam'
        },
        {
            id: 'CDT0307',
            text: 'Trường Cao đẳng nghề VMU'
        },
        {
            id: 'CDT0308',
            text: 'Trường Cao đẳng nghề Du lịch và dịch vụ Hải Phòng'
        },
        {
            id: 'CDT0309',
            text: 'Trường Cao đẳng nghề Công nghệ, Kinh tế và Thủy sản'
        },
        {
            id: 'CDT0310',
            text: 'Trường Cao đẳng nghề Kinh tế - Kỹ thuật Bắc Bộ'
        },
        {
            id: 'CDD0311',
            text: 'Trường Cao đẳng nghề Lao Động - Xã hội Hải Phòng'
        },
        {
            id: 'CDT2201',
            text: 'Trường Cao đẳng nghề Cơ điện và Thủy lợi'
        },
        {
            id: 'CDT2202',
            text: 'Trường Cao đẳng nghề Kinh tế - Kỹ thuật Tô Hiệu'
        },
        {
            id: 'CDD2203',
            text: 'Trường Cao đẳng nghề Kỹ thuật - Công nghệ LOD'
        },
        {
            id: 'CDT2301',
            text: 'Trường Cao đẳng nghề Thái Bình'
        },
        {
            id: 'CDT2302',
            text: 'Trường Cao đẳng nghề số 19 - Bộ Quốc phòng'
        },
        {
            id: 'CDT2401',
            text: 'Trường Cao đẳng nghề Công nghệ, Kinh tế và Chế biến lâm sản'
        },
        {
            id: 'CDD2402',
            text: 'Trường Cao đẳng nghề Hà Nam'
        },
        {
            id: 'CDD2501',
            text: 'Trường Cao đẳng nghề Nam Định'
        },
        {
            id: 'CDT2502',
            text: 'Trường Cao đẳng nghề Kinh tế - Kỹ thuật Vinatex'
        },
        {
            id: 'CDT2503',
            text: 'Trường Cao đẳng nghề Số 20 - Bộ Quốc phòng'
        },
        {
            id: 'CDT2701',
            text: 'Trường Cao đẳng nghề Cơ điện Xây dựng Việt Xô'
        },
        {
            id: 'CDT2702',
            text: 'Trường Cao đẳng nghề Cơ giới Ninh Bình'
        },
        {
            id: 'CDT2703',
            text: 'Trường Cao đẳng nghề LiLama 1'
        },
        {
            id: 'CDT2704',
            text: 'Trường Cao đẳng nghề số 13 - Bộ Quốc phòng'
        },
        {
            id: 'CDD0501',
            text: 'Trường Cao đẳng nghề Tỉnh Hà Giang'
        },
        {
            id: 'CDD0901',
            text: 'Trường Cao đẳng nghề Kỹ thuật - Công nghệ Tuyên Quang'
        },
        {
            id: 'CDD0801',
            text: 'Trường Cao đẳng nghề Lào Cai'
        },
        {
            id: 'CDD1301',
            text: 'Trường Cao đẳng nghề Âu Lạc'
        },
        {
            id: 'CDD1302',
            text: 'Trường Cao đẳng nghề Yên Bái'
        },
        {
            id: 'CDT1201',
            text: 'Trường Cao đẳng nghề Cơ điện - Luyện kim Thái Nguyên'
        },
        {
            id: 'CDT1202',
            text: 'Trường Cao đẳng nghề Công nghiệp Việt Bắc - Vinacomin'
        },
        {
            id: 'CDT1203',
            text: 'Trường Cao đẳng nghề Số 1 - Bộ Quốc phòng'
        },
        {
            id: 'CDD1204',
            text: 'Trường Cao đẳng nghề Công thương Việt Nam'
        },
        {
            id: 'CDT1001',
            text: 'Trường Cao đẳng nghề Công nghệ và Nông lâm Đông Bắc'
        },
        {
            id: 'CDT1002',
            text: 'Trường Cao đẳng nghề Lạng Sơn'
        },
        {
            id: 'CDT1701',
            text: 'Trường Cao đẳng nghề Than - Khoáng sản Việt Nam'
        },
        {
            id: 'CDT1702',
            text: 'Trường Cao đẳng nghề Xây dựng'
        },
        {
            id: 'CDT1703',
            text: 'Trường Cao đẳng nghề Giao thông Cơ điện Quảng Ninh'
        },
        {
            id: 'CDD1801',
            text: 'Trường Cao đẳng nghề Bắc Giang'
        },
        {
            id: 'CDD1802',
            text: 'Trường Cao đẳng nghề Công nghệ Việt - Hàn Bắc Giang'
        },
        {
            id: 'CDT1501',
            text: 'Trường Cao đẳng nghề Cơ điện Phú Thọ'
        },
        {
            id: 'CDT1502',
            text: 'Trường Cao đẳng nghề Công nghệ Giấy và Cơ điện'
        },
        {
            id: 'CDD1503',
            text: 'Trường Cao đẳng nghề Phú Thọ'
        },
        {
            id: 'CDT1504',
            text: 'Trường Cao đẳng nghề Công nghệ và Nông Lâm Phú Thọ'
        },
        {
            id: 'CDD6201',
            text: 'Trường Cao đẳng nghề Tỉnh Điện Biên'
        },
        {
            id: 'CDD1401',
            text: 'Trường Cao đẳng nghề Tỉnh Sơn La'
        },
        {
            id: 'CDT23011',
            text: 'Trường Cao đẳng nghề Sông Đà'
        },
        {
            id: 'CDT23021',
            text: 'Trường Cao đẳng nghề Cơ điện Tây Bắc'
        },
        {
            id: 'CDD2303',
            text: 'Trường Cao đẳng nghề Hòa Bình'
        },
        {
            id: 'CDD2801',
            text: 'Trường Cao đẳng nghề Công nghiệp Thanh Hoá'
        },
        {
            id: 'CDD2802',
            text: 'Trường Cao đẳng nghề Lam Kinh'
        },
        {
            id: 'CDT2803',
            text: 'Trường Cao đẳng nghề Công nghệ LICOGI'
        },
        {
            id: 'CDD2804',
            text: 'Trường Cao đẳng nghề An Nhất Vinh'
        },
        {
            id: 'CDD2805',
            text: 'Trường Cao đẳng nghề Kinh tế - Công nghệ VICET'
        },
        {
            id: 'CDD2901',
            text: 'Trường Cao đẳng nghề Việt - Đức Nghệ An'
        },
        {
            id: 'CDD2902',
            text: 'Trường Cao đẳng nghề Kỹ thuật Công nghiệp Việt Nam - Hàn Quốc'
        },
        {
            id: 'CDD2903',
            text: 'Trường Cao đẳng nghề Du lịch - Thương mại Nghệ An'
        },
        {
            id: 'CDT2904',
            text: 'Trường Cao đẳng nghề Kinh tế - Kỹ thuật số 1 Nghệ An'
        },
        {
            id: 'CDT2905',
            text: 'Trường Cao đẳng nghề Số 4 - Bộ Quốc Phòng'
        },
        {
            id: 'CDT2906',
            text: 'Trường Cao đẳng nghề Hàng hải Vinalines'
        },
        {
            id: 'CDD3001',
            text: 'Trường Cao đẳng nghề Việt - Đức Hà Tĩnh'
        },
        {
            id: 'CDT3002',
            text: 'Trường Cao đẳng nghề Công nghệ Hà Tĩnh'
        },
        {
            id: 'CDD3101',
            text: 'Trường Cao đẳng nghề Quảng Bình'
        },
        {
            id: 'CDT3301',
            text: 'Trường Cao đẳng nghề Du lịch Huế'
        },
        {
            id: 'CDD3302',
            text: 'Trường Cao đẳng nghề Nguyễn Tri Phương'
        },
        {
            id: 'CDD3303',
            text: 'Trường Cao đẳng nghề Thừa Thiên Huế'
        },
        {
            id: 'CDD0401',
            text: 'Trường Cao đẳng nghề Đà Nẵng'
        },
        {
            id: 'CDD0402',
            text: 'Trường Cao đẳng nghề Hoa Sen'
        },
        {
            id: 'CDD0403',
            text: 'Trường Cao đẳng nghề Nguyễn Văn Trỗi'
        },
        {
            id: 'CDT0404',
            text: 'Trường Cao đẳng nghề Du lịch Đà Nẵng'
        },
        {
            id: 'CDT0405',
            text: 'Trường Cao đẳng nghề Số 5 - Bộ Quốc phòng'
        },
        {
            id: 'CDD0406',
            text: 'Trường Cao đẳng nghề Việt - Úc'
        },
        {
            id: 'CDD3401',
            text: 'Trường Cao đẳng nghề Chu Lai - Trường Hải'
        },
        {
            id: 'CDD3402',
            text: 'Trường Cao đẳng nghề Tỉnh Quảng Nam'
        },
        {
            id: 'CDT3501',
            text: 'Trường Cao đẳng nghề Kỹ thuật Công nghệ Dung Quất'
        },
        {
            id: 'CDT3502',
            text: 'Trường Cao đẳng nghề Cơ giới Quảng Ngãi'
        },
        {
            id: 'CDT3701',
            text: 'Trường Cao đẳng nghề Cơ điện - Xây dựng và Nông lâm Trung Bộ'
        },
        {
            id: 'CDD3702',
            text: 'Trường Cao đẳng nghề Quy Nhơn'
        },
        {
            id: 'CDD3901',
            text: 'Trường Cao đẳng nghề Phú Yên'
        },
        {
            id: 'CDD4101',
            text: 'Trường Cao đẳng nghề Nha Trang'
        },
        {
            id: 'CDD4102',
            text: 'Trường Cao đẳng nghề Quốc tế Nam Việt'
        },
        {
            id: 'CDT4103',
            text: 'Trường Cao đẳng nghề Du lịch Nha Trang'
        },
        {
            id: 'CDD4501',
            text: 'Trường Cao đẳng nghề Ninh Thuận'
        },
        {
            id: 'CDD4701',
            text: 'Trường Cao đẳng nghề Bình Thuận'
        },
        {
            id: 'CDD3801',
            text: 'Trường Cao đẳng nghề Gia Lai'
        },
        {
            id: 'CDD4001',
            text: 'Trường Cao đẳng nghề Thanh niên Dân tộc Tây Nguyên'
        },
        {
            id: 'CDD4002',
            text: 'Trường Cao đẳng nghề Đắk Lắk'
        },
        {
            id: 'CDD4201',
            text: 'Trường Cao đẳng nghề Đà Lạt'
        },
        {
            id: 'CDT4202',
            text: 'Trường Cao đẳng nghề Du lịch Đà Lạt'
        },
        {
            id: 'CDD4401',
            text: 'Trường Cao đẳng nghề Việt Nam - Singapore'
        },
        {
            id: 'CDD4402',
            text: 'Trường Cao đẳng nghề Công nghệ cao Đồng An'
        },
        {
            id: 'CDT4403',
            text: 'Trường Cao đẳng nghề Công nghệ và Nông lâm Nam Bộ'
        },
        {
            id: 'CDD4404',
            text: 'Trường Cao đẳng nghề Kỹ thuật Thiết bị Y tế Bình Dương'
        },
        {
            id: 'CDD4405',
            text: 'Trường Cao đẳng nghề số 22 - Bộ Quốc phòng'
        },
        {
            id: 'CDD4406',
            text: 'Trường Cao đẳng nghề Bình Phước'
        },
        {
            id: 'CDD4407',
            text: 'Trường Cao đẳng nghề Tây Ninh'
        },
        {
            id: 'CDT4801',
            text: 'Trường Cao đẳng nghề LiLama 2'
        },
        {
            id: 'CDT4802',
            text: 'Trường Cao đẳng nghề số 8 - Bộ Quốc phòng'
        },
        {
            id: 'CDD4803',
            text: 'Trường Cao đẳng nghề Đồng Nai'
        },
        {
            id: 'CDT4804',
            text: 'Trường Cao đẳng nghề Cơ giới và Thủy lợi'
        },
        {
            id: 'CDD4805',
            text: 'Trường Cao đẳng nghề Công nghệ cao Đồng Nai'
        },
        {
            id: 'CDT5201',
            text: 'Trường Cao đẳng nghề Dầu Khí'
        },
        {
            id: 'CDT5202',
            text: 'Trường Cao đẳng nghề Du lịch Vũng Tàu'
        },
        {
            id: 'CDD5203',
            text: 'Trường Cao đẳng nghề Tỉnh Bà Rịa - Vũng Tàu'
        },
        {
            id: 'CDD5204',
            text: 'Trường Cao đẳng nghề Quốc tế Vabis Hồng Lam'
        },
        {
            id: 'CDD4901',
            text: 'Trường Cao đẳng nghề Kỹ thuật Công nghệ LaDec'
        },
        {
            id: 'CDD4902',
            text: 'Trường Cao đẳng nghề Long An'
        },
        {
            id: 'CDD4903',
            text: 'Trường Cao đẳng nghề Tây Sài Gòn'
        },
        {
            id: 'CDD5301',
            text: 'Trường Cao đẳng nghề Tiền Giang'
        },
        {
            id: 'CDD5602',
            text: 'Trường Cao đẳng nghề Trà Vinh'
        },
        {
            id: 'CDD5603',
            text: 'Trường Cao đẳng nghề số 9 - Bộ Quốc phòng'
        },
        {
            id: 'CDD5604',
            text: 'Trường Cao đẳng nghề Vĩnh Long'
        },
        {
            id: 'CDD5001',
            text: 'Trường Cao đẳng nghề Đồng Tháp'
        },
        {
            id: 'CDD5101',
            text: 'Trường Cao đẳng nghề An Giang'
        },
        {
            id: 'CDD5401',
            text: 'Trường Cao đẳng nghề Kiên Giang'
        },
        {
            id: 'CDD5501',
            text: 'Trường Cao đẳng nghề Cần Thơ'
        },
        {
            id: 'VH01',
            text: 'Trường Cao đẳng nghề Du lịch Cần Thơ'
        },
        {
            id: 'CDD6401',
            text: 'Trường Cao đẳng nghề Trần Đại Nghĩa'
        },
        {
            id: 'CDD5901',
            text: 'Trường Cao đẳng nghề Sóc Trăng'
        },
        {
            id: 'CDD6001',
            text: 'Trường Cao đẳng nghề Bạc Liêu'
        },
        {
            id: 'TCD0103',
            text: 'Trường Trung cấp nghề Dân lập Cờ Đỏ'
        },
        {
            id: 'TCD0104',
            text: 'Trường Trung cấp nghề Nấu ăn và Nghiệp vụ khách sạn Hà Nội'
        },
        {
            id: 'TCT0105',
            text: 'Trường Trung cấp nghề Giao thông vận tải Thăng Long'
        },
        {
            id: 'TCD0106',
            text: 'Trường Trung cấp nghề Đồng Hồ - Điện tử - Tin học Hà Nội'
        },
        {
            id: 'TCD0107',
            text: 'Trường Trung cấp nghề Thăng Long'
        },
        {
            id: 'TCT0108',
            text: 'Trường Trung cấp nghề Cơ khí Xây dựng'
        },
        {
            id: 'TCD0109',
            text: 'Trường Trung cấp nghề Giao thông công chính Hà Nội'
        },
        {
            id: 'TCT0110',
            text: 'Trường Trung cấp nghề Số 17 - Bộ Quốc phòng'
        },
        {
            id: 'TCD0111',
            text: 'Trường Trung cấp nghề Dân lập Kỹ thuật tổng hợp Hà Nội'
        },
        {
            id: 'TCD0112',
            text: 'Trường Trung cấp nghề Công nghệ Thăng Long'
        },
        {
            id: 'TCD0113',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật VINAMOTOR'
        },
        {
            id: 'TCT0114',
            text: 'Trường Trung cấp nghề Số 10 - Bộ Quốc phòng'
        },
        {
            id: 'TCT0115',
            text: 'Trường Trung cấp nghề Công trình 1'
        },
        {
            id: 'TCD0116',
            text: 'Trường Trung cấp nghề Tư thục Dạy nghề Du lịch Hà Nội'
        },
        {
            id: 'TCD0117',
            text: 'Trường Trung cấp nghề Cơ khí 1 Hà Nội'
        },
        {
            id: 'TCD0118',
            text: 'Trường Trung cấp nghề May và Thời trang Hà Nội'
        },
        {
            id: 'TCD0119',
            text: 'Trường Trung cấp nghề Kỹ thuật và Nghiệp vụ xây dựng Hà Nội'
        },
        {
            id: 'TCD0120',
            text: 'Trường Trung cấp nghề Kỹ nghệ thực hành HIPT'
        },
        {
            id: 'TCD0121',
            text: 'Trường Trung cấp nghề Dân lập Quang Trung'
        },
        {
            id: 'TCD0122',
            text: 'Trường Trung cấp nghề DL Công nghệ và Nghiệp vụ tổng hợp Hà Nội'
        },
        {
            id: 'TCD0123',
            text: 'Trường Trung cấp nghề Quốc tế Kinh tế - Kỹ thuật Hà Nội'
        },
        {
            id: 'TCD0124',
            text: 'Trường Trung cấp nghề Quốc tế Việt - Úc'
        },
        {
            id: 'TCD0125',
            text: 'Trường Trung cấp nghề Tư thục Formach'
        },
        {
            id: 'TCT0126',
            text: 'Trường Trung cấp nghề Công Đoàn Việt Nam'
        },
        {
            id: 'TCD0127',
            text: 'Trường Trung cấp nghề Công nghệ ô tô'
        },
        {
            id: 'TCD0129',
            text: 'Trường Trung cấp nghề Việt Tiệp'
        },
        {
            id: 'TCT0130',
            text: 'Trường Trung cấp nghề Số 18 - Bộ Quốc phòng'
        },
        {
            id: 'TCD0131',
            text: 'Trường Trung cấp nghề Tổng hợp Hà Nội'
        },
        {
            id: 'TCD0132',
            text: 'Trường Trung cấp nghề Số 1 Hà Nội'
        },
        {
            id: 'TCD0133',
            text: 'Trường Trung cấp nghề Điện tử - Cơ khí và Xây dựng Việt Hàn'
        },
        {
            id: 'TCD0134',
            text: 'Trường Trung cấp nghề Nhân lực Quốc tế Hà Nội'
        },
        {
            id: 'TCD0135',
            text: 'Trường Trung cấp nghề Âu Việt'
        },
        {
            id: 'TCD0136',
            text: 'Trường Trung cấp nghề Công nghệ Tây An'
        },
        {
            id: 'TCD0137',
            text: 'Trường Trung cấp nghề Sơn Tây'
        },
        {
            id: 'TCD0138',
            text: 'Trường Trung cấp nghề Vân Canh'
        },
        {
            id: 'TCD0139',
            text: 'Trường Trung cấp nghề Kỹ thuật và Công nghệ'
        },
        {
            id: 'TCD0141',
            text: 'Trường Trung cấp nghề Kỹ thuật và Nghiệp vụ Du lịch Quang Minh'
        },
        {
            id: 'TCT0142',
            text: 'Trường Trung cấp nghề Đào tạo nhân lực VINACONEX'
        },
        {
            id: 'TCD0143',
            text: 'Trường Trung cấp nghề Phùng Khắc Khoan'
        },
        {
            id: 'TCT0144',
            text: 'Trường Trung cấp nghề Hội Cựu chiến binh Việt Nam'
        },
        {
            id: 'TCD0145',
            text: 'Trường Trung cấp nghề Thông tin và Truyền thông Hà Nội'
        },
        {
            id: 'TCD0146',
            text: 'Trường Trung cấp nghề Kỹ thuật Công nghệ Vạn Xuân'
        },
        {
            id: 'TCT0147',
            text: 'Trường Trung cấp nghề Công Đoàn Hà Nội'
        },
        {
            id: 'TCT0148',
            text: 'Trường Trung cấp nghề Hội Nông dân Việt Nam'
        },
        {
            id: 'TCD0201',
            text: 'Trường Trung cấp nghề Kỹ thuật Nghiệp vụ Tôn Đức Thắng'
        },
        {
            id: 'TCD0202',
            text: 'Trường Trung cấp nghề Kỹ thuật Cơ khí giao thông'
        },
        {
            id: 'TCD0203',
            text: 'Trường Trung cấp nghề Tư thục Quản lý Khách sạn Việt Úc'
        },
        {
            id: 'TCD0204',
            text: 'Trường Trung cấp nghề Quang Trung'
        },
        {
            id: 'TCT0205',
            text: 'Trường Trung cấp nghề Nhân lực Quốc tế'
        },
        {
            id: 'TCD0206',
            text: 'Trường Trung cấp nghề Du lịch Khôi Việt'
        },
        {
            id: 'TCT0207',
            text: 'Trường Trung cấp nghề Lê Thị Riêng'
        },
        {
            id: 'TCD0209',
            text: 'Trường Trung cấp nghề Thủ Đức'
        },
        {
            id: 'TCD0210',
            text: 'Trường Trung cấp nghề Kỹ thuật Công nghệ Hùng Vương'
        },
        {
            id: 'TCD0211',
            text: 'Trường Trung cấp nghề Nhân Đạo'
        },
        {
            id: 'TCD0212',
            text: 'Trường Trung cấp nghề Tư thục Duy Tân'
        },
        {
            id: 'TCD0213',
            text: 'Trường Trung cấp nghề Ngọc Phước'
        },
        {
            id: 'TCD0214',
            text: 'Trường Trung cấp nghề Du lịch và Tiếp thị Quốc tế'
        },
        {
            id: 'TCT0215',
            text: 'Trường Trung cấp nghề Số 7 - Bộ Quốc phòng'
        },
        {
            id: 'TCD0216',
            text: 'Trường Trung cấp nghề Xây lắp điện'
        },
        {
            id: 'TCT0217',
            text: 'Trường Trung cấp nghề Công nghiệp và Xây dựng FICO'
        },
        {
            id: 'TCT0218',
            text: 'Trường Trung cấp nghề Công nghiệp Tàu thuỷ 2'
        },
        {
            id: 'TCD0220',
            text: 'Trường Trung cấp nghề Củ Chi'
        },
        {
            id: 'TCD0221',
            text: 'Trường Trung cấp nghề An Đức'
        },
        {
            id: 'TCD0222',
            text: 'Trường Trung cấp nghề Tư thục Hoàn Cầu'
        },
        {
            id: 'TCD0223',
            text: 'Trường Trung cấp nghề Tư thục Việt Giao'
        },
        {
            id: 'TCD0224',
            text: 'Trường Trung cấp nghề Công nghệ Bách khoa'
        },
        {
            id: 'TCD0225',
            text: 'Trường Trung cấp nghề Tư thục Kỹ thuật - Kinh tế Sài Gòn 3'
        },
        {
            id: 'TCD0226',
            text: 'Trường Trung cấp nghề Đông Sài Gòn'
        },
        {
            id: 'TCD0227',
            text: 'Trường Trung cấp nghề Suleco'
        },
        {
            id: 'TCD0228',
            text: 'Trường Trung cấp nghề Bình Thạnh'
        },
        {
            id: 'TCD0229',
            text: 'Trường Trung cấp nghề Trần Đại Nghĩa'
        },
        {
            id: 'TCT1601',
            text: 'Trường Trung cấp nghề Số 11 - Bộ Quốc phòng'
        },
        {
            id: 'TCT1603',
            text: 'Trường Trung cấp nghề Kỹ thuật Xây dựng và Nghiệp vụ'
        },
        {
            id: 'TCT1903',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật Bắc Ninh'
        },
        {
            id: 'TCD1906',
            text: 'Trường Trung cấp nghề Âu Lạc'
        },
        {
            id: 'TCT1907',
            text: 'Trường Trung cấp nghề Kỹ thuật cao Bắc Ninh'
        },
        {
            id: 'TCD1908',
            text: 'Trường Trung cấp nghề Đông Đô'
        },
        {
            id: 'TCD1909',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật Hà Nội'
        },
        {
            id: 'TCD1910',
            text: 'Trường Trung cấp nghề Quốc tế Đông Dương'
        },
        {
            id: 'TCD1911',
            text: 'Trường Trung cấp nghề Thuận Thành'
        },
        {
            id: 'TCD1915',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật và TC Mỹ nghệ truyền thống Thuận Thành'
        },
        {
            id: 'TCT2101',
            text: 'Trường Trung cấp nghề Cơ giới đường bộ'
        },
        {
            id: 'TCD2102',
            text: 'Trường Trung cấp nghề Việt Nam - Canada, Tình Hải Dương'
        },
        {
            id: 'TCD2103',
            text: 'Trường Trung cấp nghề CNT Hải Dương'
        },
        {
            id: 'TCT2104',
            text: 'Trường Trung cấp nghề 8/3 Hải Dương'
        },
        {
            id: 'TCD0301',
            text: 'Trường Trung cấp nghề Thủy sản'
        },
        {
            id: 'TCD0302',
            text: 'Trường Trung cấp nghề Giao thông vận tải'
        },
        {
            id: 'TCT0304',
            text: 'Trường Trung cấp nghề Công nghiệp Tàu thủy Bạch Đằng'
        },
        {
            id: 'TCT0305',
            text: 'Trường Trung cấp nghề Kỹ thuật Xi măng'
        },
        {
            id: 'TCD0306',
            text: 'Trường Trung cấp nghề Xây dựng'
        },
        {
            id: 'TCT0307',
            text: 'Trường Trung cấp nghề Công nghiệp Tàu thủy Phà Rừng'
        },
        {
            id: 'TCD0308',
            text: 'Trường Trung cấp nghề An Dương'
        },
        {
            id: 'TCD0311',
            text: 'Trường Trung cấp nghề Công nghiệp - Du lịch Thăng Long'
        },
        {
            id: 'TCD0312',
            text: 'Trường Trung cấp nghề Thủy Nguyên'
        },
        {
            id: 'TCD0313',
            text: 'Trường Trung cấp nghề Nghiệp vụ cảng'
        },
        {
            id: 'TCD0314',
            text: 'Trường Trung cấp nghề Phát triển nông thôn Thành Phát'
        },
        {
            id: 'TCD2201',
            text: 'Trường Trung cấp nghề Giao thông vận tải Hưng Yên'
        },
        {
            id: 'TCD2202',
            text: 'Trường Trung cấp nghề Hưng Yên'
        },
        {
            id: 'TCD2203',
            text: 'Trường Trung cấp nghề Việt Thanh'
        },
        {
            id: 'TCD2204',
            text: 'Trường Trung cấp nghề Châu Hưng'
        },
        {
            id: 'TCD2205',
            text: 'Trường Trung cấp nghề CIENCO 8'
        },
        {
            id: 'TCD2206',
            text: 'Trường Trung cấp nghề Á Châu'
        },
        {
            id: 'TCD2601',
            text: 'Trường Trung cấp nghề Thái Bình'
        },
        {
            id: 'TCD2603',
            text: 'Trường Trung cấp nghề cho người khuyết tật'
        },
        {
            id: 'TCD2604',
            text: 'Trường Trung cấp nghề Tư thục Việt Đức'
        },
        {
            id: 'TCD2605',
            text: 'Trường Trung cấp nghề Giao thông vận tải Thái Bình'
        },
        {
            id: 'TCD2606',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật Công nghiệp'
        },
        {
            id: 'TCT2607',
            text: 'Trường Trung cấp nghề Công nghiệp Tàu thủy Thái Bình'
        },
        {
            id: 'TCD2608',
            text: 'Trường Trung cấp nghề Thủ công mỹ nghệ Kiến Xương'
        },
        {
            id: 'TCT2401',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật Hà Nam'
        },
        {
            id: 'TCD2402',
            text: 'Trường Trung cấp nghề Kỹ thuật cao Quốc tế'
        },
        {
            id: 'TCD2403',
            text: 'Trường Trung cấp nghề Giao thông - Xây dựng Việt Úc'
        },
        {
            id: 'TCD2404',
            text: 'Trường Trung cấp nghề Công nghiệp Hà Nam'
        },
        {
            id: 'TCT2501',
            text: 'Trường Trung cấp nghề Công nghiệp Tàu thủy IV'
        },
        {
            id: 'TCT2503',
            text: 'Trường Trung cấp nghề Số 8'
        },
        {
            id: 'TCD2504',
            text: 'Trường Trung cấp nghề Kỹ thuật Công nghiệp Nam Định'
        },
        {
            id: 'TCD2505',
            text: 'Trường Trung cấp nghề Thủ công mỹ nghệ truyền thống Nam Định'
        },
        {
            id: 'TCD2506',
            text: 'Trường Trung cấp nghề Giao thông vận tải Nam Định'
        },
        {
            id: 'TCD2507',
            text: 'Trường Trung cấp nghề Đại Lâm'
        },
        {
            id: 'TCD2508',
            text: 'Trường Trung cấp nghề Thương mại - Du lịch - Dịch vụ Nam Định'
        },
        {
            id: 'TCT2701',
            text: 'Trường Trung cấp nghề số 14 - Bộ Quốc phòng'
        },
        {
            id: 'TCD2703',
            text: 'Trường Trung cấp nghề Thành Nam'
        },
        {
            id: 'TCD2704',
            text: 'Trường Trung cấp nghề Nho Quan'
        },
        {
            id: 'TCD2705',
            text: 'Trường Trung cấp nghề Tư thục Mỹ thuật xây dựng cơ khí Thanh Bình'
        },
        {
            id: 'TCD2706',
            text: 'Trường Trung cấp nghề Việt Nam - Canada, Tình Ninh Bình'
        },
        {
            id: 'TCD2707',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật Công đoàn Ninh Bình'
        },
        {
            id: 'TCD0501',
            text: 'Trường Trung cấp nghề Bắc Quang'
        },
        {
            id: 'TCD0601',
            text: 'Trường Trung cấp nghề Tỉnh Cao Bằng'
        },
        {
            id: 'TCD1101',
            text: 'Trường Trung cấp nghề Bắc Kạn'
        },
        {
            id: 'TCD0901',
            text: 'Trường Trung cấp nghề Tiến bộ Quốc tế'
        },
        {
            id: 'TCD0902',
            text: 'Trường Trung cấp nghề Công nghệ Tuyên Quang'
        },
        {
            id: 'TCT0801',
            text: 'Trường Trung cấp nghề Công ty Apatit Lào Cai'
        },
        {
            id: 'TCD1301',
            text: 'Trường Trung cấp nghề Nghĩa Lộ'
        },
        {
            id: 'TCD1302',
            text: 'Trường Trung cấp nghề Lục Yên'
        },
        {
            id: 'TCT1303',
            text: 'Trường Trung cấp nghề 20/10 khu vực Tây Bắc'
        },
        {
            id: 'TCT1201',
            text: 'Trường Trung cấp nghề Thái Nguyên'
        },
        {
            id: 'TCD1203',
            text: 'Trường Trung cấp nghề Tiến bộ'
        },
        {
            id: 'TCD1204',
            text: 'Trường Trung cấp nghề Nam Thái Nguyên'
        },
        {
            id: 'TCD1206',
            text: 'Trường Trung cấp nghề Thái Hà'
        },
        {
            id: 'TCD1207',
            text: 'Trường Trung cấp nghề Giao thông vận tải Thái Nguyên'
        },
        {
            id: 'TCD1208',
            text: 'Trường Trung cấp nghề Dân tộc nội trú Thái Nguyên'
        },
        {
            id: 'TCD1210',
            text: 'Trường Trung cấp nghề Kỹ thuật 3D'
        },
        {
            id: 'TCD1701',
            text: 'Trường Trung cấp nghề Xây dựng và Công nghiệp Quảng Ninh'
        },
        {
            id: 'TCD1702',
            text: 'Trường Trung cấp nghề Giao thông cơ điện Quảng Ninh'
        },
        {
            id: 'TCD1703',
            text: 'Trường Trung cấp nghề Công nghệ Hạ Long'
        },
        {
            id: 'TCT1801',
            text: 'Trường Trung cấp nghề Số 12'
        },
        {
            id: 'TCD1802',
            text: 'Trường Trung cấp nghề Giao thông vận tải Bắc Giang'
        },
        {
            id: 'TCT1803',
            text: 'Trường Trung cấp nghề Công nghiệp Tàu thủy VII'
        },
        {
            id: 'TCD1804',
            text: 'Trường Trung cấp nghề Miền núi Yên Thế'
        },
        {
            id: 'TCD1805',
            text: 'Trường Trung cấp nghề Số 1 Bắc Giang'
        },
        {
            id: 'TCD1806',
            text: 'Trường Trung cấp nghề Thủ công mỹ nghệ 19/5 Bắc Giang'
        },
        {
            id: 'TCD1807',
            text: 'Trường Trung cấp nghề Xương Giang'
        },
        {
            id: 'TCD1501',
            text: 'Trường Trung cấp nghề Herman Gmerner Việt Trì'
        },
        {
            id: 'TCD1502',
            text: 'Trường Trung cấp nghề Công nghệ và vận tải Phú Thọ'
        },
        {
            id: 'TCD1503',
            text: 'Trường Trung cấp nghề Dân tộc nội trú Phú Thọ'
        },
        {
            id: 'TCD1504',
            text: 'Trường Trung cấp nghề Bách khoa - Phú Thọ'
        },
        {
            id: 'TCD1505',
            text: 'Trường Trung cấp nghề Công nghệ - Dịch vụ và Du lịch Phú Nam'
        },
        {
            id: 'TCD0701',
            text: 'Trường Trung cấp nghề Tỉnh Lai Châu'
        },
        {
            id: 'TCD2301',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật Công nghiệp Hoà Bình'
        },
        {
            id: 'TCD2302',
            text: 'Trường Trung cấp nghề Tất Thành'
        },
        {
            id: 'TCD2801',
            text: 'Trường Trung cấp nghề Miền núi Thanh Hóa'
        },
        {
            id: 'TCD2802',
            text: 'Trường Trung cấp nghề Kỹ nghệ Thanh Hóa'
        },
        {
            id: 'TCD2803',
            text: 'Trường Trung cấp nghề Thương Mại - Du lịch Thanh Hoá'
        },
        {
            id: 'TCD2804',
            text: 'Trường Trung cấp nghề Phát thanh - Truyền hình Thanh Hoá'
        },
        {
            id: 'TCD2805',
            text: 'Trường Trung cấp nghề Giao thông vận tải Thanh Hoá'
        },
        {
            id: 'TCD2806',
            text: 'Trường Trung cấp nghề Xây dựng Thanh Hoá'
        },
        {
            id: 'TCD2807',
            text: 'Trường Trung cấp nghề Nông nghiệp và Phát triển nông thôn Thanh Hoá'
        },
        {
            id: 'TCD2808',
            text: 'Trường Trung cấp nghề Bỉm Sơn'
        },
        {
            id: 'TCD2809',
            text: 'Trường Trung cấp nghề Nghi Sơn'
        },
        {
            id: 'TCD2811',
            text: 'Trường Trung cấp nghề Vinashin 9'
        },
        {
            id: 'TCD2812',
            text: 'Trường Trung cấp nghề Tư thục Việt Trung'
        },
        {
            id: 'TCD2813',
            text: 'Trường Trung cấp nghề Thanh thiếu niên đặc biệt khó khăn'
        },
        {
            id: 'TCD2814',
            text: 'Trường Trung cấp nghề Hưng Đô'
        },
        {
            id: 'TCD2815',
            text: 'Trường Trung cấp nghề Nga Sơn'
        },
        {
            id: 'TCD2816',
            text: 'Trường Trung cấp nghề Quảng Xương'
        },
        {
            id: 'TCD2817',
            text: 'Trường Trung cấp nghề Số 1 Thành phố Thanh Hóa'
        },
        {
            id: 'TCD2818',
            text: 'Trường Trung cấp nghề Thạch Thành'
        },
        {
            id: 'TCD2901',
            text: 'Trường Trung cấp nghề Việt - Úc'
        },
        {
            id: 'TCD2902',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật miền Tây Nghệ An'
        },
        {
            id: 'TCD2904',
            text: 'Trường Trung cấp nghề Kinh tế - Công nghiệp - Thủ công nghiệp Nghệ An'
        },
        {
            id: 'TCD2905',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật Công nghiệp Vinh'
        },
        {
            id: 'TCD2907',
            text: 'Trường Trung cấp nghề Kỹ thuật Công - Nông nghiệp Yên Thành'
        },
        {
            id: 'TCD2908',
            text: 'Trường Trung cấp nghề Dân tộc miền núi Nghệ An'
        },
        {
            id: 'TCD2909',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật Bắc Nghệ An'
        },
        {
            id: 'TCD2910',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật Đô Lương'
        },
        {
            id: 'TCD2911',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật Nghi Lộc'
        },
        {
            id: 'TCD3002',
            text: 'Trường Trung cấp nghề Hà Tĩnh'
        },
        {
            id: 'TCD3003',
            text: 'Trường Trung cấp nghề Lý Tự Trọng'
        },
        {
            id: 'TCD3004',
            text: 'Trường Trung cấp nghề Việt Nhật'
        },
        {
            id: 'TCD3005',
            text: 'Trường Trung cấp nghề Mitraco'
        },
        {
            id: 'TCT3101',
            text: 'Trường Trung cấp nghề Số 9'
        },
        {
            id: 'TCD3102',
            text: 'Trường Trung cấp nghề Quảng Bình'
        },
        {
            id: 'TCD3103',
            text: 'Trường Trung cấp nghề Bắc Miền Trung'
        },
        {
            id: 'TCD3201',
            text: 'Trường Trung cấp nghề Quảng Trị'
        },
        {
            id: 'TCD3202',
            text: 'Trường Trung cấp nghề Giao thông vận tải Quảng Trị'
        },
        {
            id: 'TCD3203',
            text: 'Trường Trung cấp nghề Tổng hợp ASEAN'
        },
        {
            id: 'TCD3301',
            text: 'Trường Trung cấp nghề Huế'
        },
        {
            id: 'TCD3302',
            text: 'Trường Trung cấp nghề Tổng hợp Huế Star'
        },
        {
            id: 'TCD3303',
            text: 'Trường Trung cấp nghề Số 10'
        },
        {
            id: 'TCD3304',
            text: 'Trường Trung cấp nghề Công nghiệp Tàu thủy Huế'
        },
        {
            id: 'TCD3305',
            text: 'Trường Trung cấp nghề Quảng Điền'
        },
        {
            id: 'TCD3306',
            text: 'Trường Trung cấp nghề số 23 - Bộ Quốc phòng'
        },
        {
            id: 'TCD0401',
            text: 'Trường Trung cấp nghề Việt Á'
        },
        {
            id: 'TCT0402',
            text: 'Trường Trung cấp nghề Công nghiệp Tàu thủy 3'
        },
        {
            id: 'TCT0403',
            text: 'Trường Trung cấp nghề Giao thông vận tải đường bộ'
        },
        {
            id: 'TCD0405',
            text: 'Trường Trung cấp nghề Kỹ thuật - Công nghệ Đà Nẵng'
        },
        {
            id: 'TCD0406',
            text: 'Trường Trung cấp nghề Giao thông công chính Đà Nẵng'
        },
        {
            id: 'TCD0407',
            text: 'Trường Trung cấp nghề Cao Thắng - Đà Nẵng'
        },
        {
            id: 'TCD3402',
            text: 'Trường Trung cấp nghề Bắc Quảng Nam'
        },
        {
            id: 'TCD3403',
            text: 'Trường Trung cấp nghề Nam Quảng Nam'
        },
        {
            id: 'TCD3404',
            text: 'Trường Trung cấp nghề Thanh niên dân tộc - Miền núi Quảng Nam'
        },
        {
            id: 'TCT3405',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật miền Trung - Tây Nguyên'
        },
        {
            id: 'TCD3405',
            text: 'Trường Trung cấp nghề Tư thục ASEAN'
        },
        {
            id: 'TCD3503',
            text: 'Trường Trung cấp nghề Quảng Ngãi'
        },
        {
            id: 'TCD3504',
            text: 'Trường Trung cấp nghề Đức Phổ'
        },
        {
            id: 'TCD3505',
            text: 'Trường Trung cấp nghề Kinh tế - Công nghệ Dung Quất'
        },
        {
            id: 'TCT3701',
            text: 'Trường Trung cấp nghề Công nghiệp Tàu thủy 5'
        },
        {
            id: 'TCD3702',
            text: 'Trường Trung cấp nghề Thủ công mỹ nghệ Bình Định'
        },
        {
            id: 'TCD3703',
            text: 'Trường Trung cấp nghề Hoài Nhơn'
        },
        {
            id: 'TCD3901',
            text: 'Trường Trung cấp nghề Thanh niên dân tộc Phú Yên'
        },
        {
            id: 'TCD4101',
            text: 'Trường Trung cấp nghề Ninh Hòa'
        },
        {
            id: 'TCD4102',
            text: 'Trường Trung cấp nghề Cam Ranh'
        },
        {
            id: 'TCD4103',
            text: 'Trường Trung cấp nghề Nha Trang'
        },
        {
            id: 'TCD4105',
            text: 'Trường Trung cấp nghề Diên Khánh'
        },
        {
            id: 'TCD4106',
            text: 'Trường Trung cấp nghề Vạn Ninh'
        },
        {
            id: 'TCD4107',
            text: 'Trường Trung cấp nghề Cam Lâm'
        },
        {
            id: 'TCD4108',
            text: 'Trường Trung cấp nghề Dân tộc nội trú Khánh Sơn'
        },
        {
            id: 'TCT4701',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật Công đoàn Bình Thuận'
        },
        {
            id: 'TCD3601',
            text: 'Trường Trung cấp nghề Kon Tum'
        },
        {
            id: 'TCT3802',
            text: 'Trường Trung cấp nghề Số 15 - Bộ Quốc phòng'
        },
        {
            id: 'TCD3803',
            text: 'Trường Trung cấp nghề An Khê'
        },
        {
            id: 'TCD3804',
            text: 'Trường Trung cấp nghề AyunPa'
        },
        {
            id: 'TCT3805',
            text: 'Trường Trung cấp nghề Số 21 - Bộ Quốc phòng'
        },
        {
            id: 'TCD4002',
            text: 'Trường Trung cấp nghề Vinasme Tây Nguyên'
        },
        {
            id: 'TCD4003',
            text: 'Trường Trung cấp nghề Bình Minh'
        },
        {
            id: 'TCD4005',
            text: 'Trường Trung cấp nghề Việt Mỹ'
        },
        {
            id: 'TCD6301',
            text: 'Trường Trung cấp nghề Đắk Nông'
        },
        {
            id: 'TCD4201',
            text: 'Trường Trung cấp nghề Bảo Lộc'
        },
        {
            id: 'TCD4202',
            text: 'Trường Trung cấp nghề Tư thục Tân Tiến'
        },
        {
            id: 'TCD4302',
            text: 'Trường Trung cấp nghề Tiên Phong'
        },
        {
            id: 'TCD4602',
            text: 'Trường Trung cấp nghề Khu vực Nam Tây Ninh'
        },
        {
            id: 'TCD4401',
            text: 'Trường Trung cấp nghề Bình Dương'
        },
        {
            id: 'TCD4402',
            text: 'Trường Trung cấp nghề Kỹ thuật và Nghiệp vụ Công đoàn Tỉnh Bình Dương'
        },
        {
            id: 'TCD4403',
            text: 'Trường Trung cấp nghề Dĩ An'
        },
        {
            id: 'TCD4404',
            text: 'Trường Trung cấp nghề Tân Uyên'
        },
        {
            id: 'TCD4405',
            text: 'Trường Trung cấp nghề Khu công nghiệp Bình Dương'
        },
        {
            id: 'TCD4406',
            text: 'Trường Trung cấp nghề Thủ Dầu Một'
        },
        {
            id: 'TCD4407',
            text: 'Trường Trung cấp nghề Việt - Hàn Bình Dương'
        },
        {
            id: 'TCD4409',
            text: 'Trường Trung cấp nghề Nghiệp vụ Bình Dương'
        },
        {
            id: 'TCD4801',
            text: 'Trường Trung cấp nghề 26/3'
        },
        {
            id: 'TCD4803',
            text: 'Trường Trung cấp nghề Giao thông vận tải Đồng Nai'
        },
        {
            id: 'TCT4804',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật số 2'
        },
        {
            id: 'TCT4805',
            text: 'Trường Trung cấp nghề Cơ điện Đông Nam Bộ'
        },
        {
            id: 'TCD4806',
            text: 'Trường Trung cấp nghề Tân Mai'
        },
        {
            id: 'TCD48071',
            text: 'Trường Trung cấp nghề Hòa Bình'
        },
        {
            id: 'TCD4808',
            text: 'Trường Trung cấp nghề Tri Thức'
        },
        {
            id: 'TCD4809',
            text: 'Trường Trung cấp nghề Đinh Tiên Hoàng'
        },
        {
            id: 'TCD5202',
            text: 'Trường Trung cấp nghề Giao thông vận tải Bà Rịa - Vũng Tàu'
        },
        {
            id: 'TCD5206',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật Công đoàn Bà Rịa - Vũng Tàu'
        },
        {
            id: 'TCD5207',
            text: 'Trường Trung cấp nghề Công nghệ thông tin TM.COMPUTER'
        },
        {
            id: 'TCD4902',
            text: 'Trường Trung cấp nghề Đức Hoà'
        },
        {
            id: 'TCD48031',
            text: 'Trường Trung cấp nghề Đồng Tháp Mười'
        },
        {
            id: 'TCD4804',
            text: 'Trường Trung cấp nghề Cần Giuộc'
        },
        {
            id: 'TCD4805',
            text: 'Trường Trung cấp nghề Quốc tế Nam Sài Gòn'
        },
        {
            id: 'TCT4806',
            text: 'Trường Trung cấp nghề Đào tạo Cán bộ Hợp tác xã miền Nam'
        },
        {
            id: 'TCD4807',
            text: 'Trường Trung cấp nghề Savina'
        },
        {
            id: 'TCD5302',
            text: 'Trường Trung cấp nghề Khu vực Cai Lậy'
        },
        {
            id: 'TCD5303',
            text: 'Trường Trung cấp nghề Khu vực Gò Công'
        },
        {
            id: 'TCD5304',
            text: 'Trường Trung cấp nghề Giao thông vận tải Tiền Giang'
        },
        {
            id: 'TCT5305',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật Công đoàn Tiền Giang'
        },
        {
            id: 'TCD5602',
            text: 'Trường Trung cấp nghề Khu vực Cù Lao Minh huyện Mỏ Cày Bắc'
        },
        {
            id: 'TCD5802',
            text: 'Trường Trung cấp nghề Dân tộc nội trú Tỉnh Trà Vinh'
        },
        {
            id: 'TCD5001',
            text: 'Trường Trung cấp nghề Giao thông vận tải Đồng Tháp'
        },
        {
            id: 'TCD5002',
            text: 'Trường Trung cấp nghề Tháp Mười'
        },
        {
            id: 'TCD5003',
            text: 'Trường Trung cấp nghề Hồng Ngự'
        },
        {
            id: 'TCD5004',
            text: 'Trường Trung cấp nghề Thanh Bình'
        },
        {
            id: 'TCD5101',
            text: 'Trường Trung cấp nghề Kinh tế - Kỹ thuật Công đoàn An Giang'
        },
        {
            id: 'TCD5102',
            text: 'Trường Trung cấp nghề Châu Đốc'
        },
        {
            id: 'TCD5103',
            text: 'Trường Trung cấp nghề Dân tộc nội trú Tỉnh An Giang'
        },
        {
            id: 'TCD5104',
            text: 'Trường Trung cấp nghề Tân Châu'
        },
        {
            id: 'TCD5105',
            text: 'Trường Trung cấp nghề Chợ Mới'
        },
        {
            id: 'TCD5402',
            text: 'Trường Trung cấp nghề Dân tộc nội trú Tỉnh Kiên Giang'
        },
        {
            id: 'TCD5403',
            text: 'Trường Trung cấp nghề Vùng U Minh Thượng'
        },
        {
            id: 'TCD5404',
            text: 'Trường Trung cấp nghề Vùng Tứ giác Long Xuyên'
        },
        {
            id: 'TCD5405',
            text: 'Trường Trung cấp nghề Tân Hiệp'
        },
        {
            id: 'TCD5501',
            text: 'Trường Trung cấp nghề Đông Dương'
        },
        {
            id: 'TCD5503',
            text: 'Trường Trung cấp nghề Thới Lai - Thành phố Cần Thơ'
        },
        {
            id: 'TCD5504',
            text: 'Trường Trung cấp nghề Khu vực Đồng Bằng sông Cửu Long'
        },
        {
            id: 'TCD5506',
            text: 'Trường Trung cấp nghề Cần Thơ'
        },
        {
            id: 'TCD6401',
            text: 'Trường Trung cấp nghề Ngã Bảy'
        },
        {
            id: 'TCD6402',
            text: 'Trường Trung cấp nghề Tỉnh Hậu Giang'
        },
        {
            id: 'TCD6001',
            text: 'Trường Trung cấp nghề Tỉnh Bạc Liêu'
        },
        {
            id: 'TCD6002',
            text: 'Trường Trung cấp nghề Tư thục STC'
        },
        {
            id: 'TCD6101',
            text: 'Trường Trung cấp nghề Cà Mau'
        },
        {
            id: 'RMIT',
            text: 'Trường Đại học Quốc tế RMIT Việt Nam'
        },
        {
            id: 'TTN0012',
            text: 'Trường APTECH'
        },
        {
            id: 'TTN0013',
            text: 'Trường Bán Công Nguyễn Đình Chiểu'
        },
        {
            id: 'KTCNHCM',
            text: 'Trường Đại học Kỹ thuật Công nghệ TP. HCM'
        },
        {
            id: 'TTNBDG',
            text: 'Trung tâm Dạy nghề Tư thục Bình Dương'
        },
        {
            id: 'TTNDNI',
            text: 'Trường Trung học Chuyên nghiệp Dân lập Công nghệ, Tin học, Viễn thông Đồng Nai'
        },
        {
            id: 'SLSU',
            text: 'Soutthernn Leyte State University (Philippines)'
        },
        {
            id: 'DTDLHN',
            text: 'Trung học Điện tử - Điện lạnh Hà Nội (thuộc SLĐ TBXH Hà Nội )'
        },
        {
            id: 'CDSPBDG',
            text: 'Trường Cao Đẳng Sư phạm Bình Dương'
        },
        {
            id: 'KNDLHCM',
            text: 'Trường Cao đẳng Kỹ nghệ Dân lập TP. HCM'
        },
        {
            id: 'SOLVAY',
            text: 'Trường Đại học Solvay - Bỉ'
        },
        {
            id: 'TTNNHCM',
            text: 'Trung tâm Ngoại ngữ - HV CTQG HCM'
        },
        {
            id: 'CTBDG',
            text: 'Trường Chính trị Bình Dương'
        },
        {
            id: 'TTGDBDG',
            text: 'Trung tâm Giáo Dục Tỉnh Bình Dương'
        },
        {
            id: 'TTNNVM',
            text: 'Trung tâm Ngôn ngữ Việt Mỹ'
        },
        {
            id: 'VDTNC',
            text: 'Viện Đào tạo và Nâng cao TP. HCM'
        },
        {
            id: 'DTPTNNL',
            text: 'Trung tâm Đào tạo và Phát triển nguồn nhân lực - ĐHQG TP. HCM'
        },
        {
            id: 'UDPTCN',
            text: 'Trung tâm Ứng dụng và Phát triển Công nghệ Tự động hóa'
        },
        {
            id: 'VDTM',
            text: 'Viện Đào tạo mở và Nghiên cứu phát triển'
        },
        {
            id: 'FLAI',
            text: 'Trung tâm Đào tạo và Phát triển Công nghệ FLAI'
        },
        {
            id: 'NLDNA',
            text: 'Viện Nghiên cứu Phát triển và Đào tạo Nhân lực Đông Nam Á'
        },
        {
            id: 'HTH',
            text: 'Hội Tin học Việt Nam'
        },
        {
            id: 'CTQG',
            text: 'Học viện Chính trị Quốc gia HCM - Phân viện Hà Nội'
        },
        {
            id: 'DHKTTTLL',
            text: 'Trường Đại học Kỹ thuật Thông tin liên lạc'
        },
        {
            id: 'CTHCQG',
            text: 'Học viện Chính trị - Hành chính quốc gia Hồ Chí Minh'
        },
        {
            id: 'THLTNVVP',
            text: 'Trường Trung học Lưu trữ và Nghiệp vụ Văn phòng'
        },
        {
            id: 'KTSTK',
            text: 'Trường Đại học Kỹ thuật Slovakia - Tiệp Khắc'
        },
        {
            id: 'DHNN',
            text: 'Trường Đại học Ngoại ngữ'
        },
        {
            id: 'HKTVN',
            text: 'Hội Kế toán Việt Nam - Thành hội TP. Hồ Chí Minh'
        },
        {
            id: 'DTBCVTI',
            text: 'Trung tâm Đào tạo Bưu chính Viễn thông I'
        },
        {
            id: 'DHQGA',
            text: 'Liên kết giữa Đại học Quốc gia và Đại học Andrews Hoa Kỳ'
        },
        {
            id: 'DHTHHN',
            text: 'Trường Đại học Tổng hợp Hà Nội'
        },
        {
            id: 'DHHW',
            text: 'Trường Đại học Hawai'
        },
        {
            id: 'DHXDHN',
            text: 'Trường Đại học Xây dựng Hà Nội'
        },
        {
            id: 'HVCTKVI',
            text: 'Học viện Chính trị Khu vực I'
        },
        {
            id: 'THGTVTKVI',
            text: 'Trường Trung học Giao thông Vận tải Khu vực I'
        },
        {
            id: 'SPNNHN',
            text: 'Trường Đại học Sư phạm Ngoại ngữ Hà Nội'
        },
        {
            id: 'DNNNHN',
            text: 'Trường Đại học Ngoại ngữ Hà Nội'
        },
        {
            id: 'QLPR',
            text: 'Viện thuộc Trường Đại học Quản lý Paris'
        },
        {
            id: 'KTQDTDBB',
            text: 'Liên kết giữa Trường Đại học Kinh tế Quốc dân và Trường Đại học Tự do Bruxelles Bỉ (Cao học Việt - Bỉ)'
        },
        {
            id: 'SPH',
            text: 'Trường Đại học Sư phạm Huế'
        },
        {
            id: 'CNBDI',
            text: 'Trường Công nhân Bưu Điện I'
        },
        {
            id: 'KTKC',
            text: 'Trường Đại học Kinh tế Khắc Cốp - Liên Xô cũ'
        },
        {
            id: 'QGIRVINE',
            text: 'Liên kết giữa Trường Đại học Quốc gia Hà Nội và Trường Đại học IRVINE Bang California - Mỹ'
        },
        {
            id: 'QGHN',
            text: 'Trường Đại học Quốc gia Hà Nội'
        },
        {
            id: 'KTQDTTPV',
            text: 'Liên kết giữa Trường Đại học Kinh tế Quốc dân và Phòng Thương mại và Công nghiệp Paris (Trung tâm Pháp Việt Đào tạo về Quản lý)'
        },
        {
            id: 'DLQLKD',
            text: 'Trường Đại học Dân lập Quản lý và Kinh doanh Hà Nội'
        },
        {
            id: 'ĐH.IV.92.0',
            text: 'Trường Đại học Tài chính Kế toán Hà Nội'
        },
        {
            id: 'QGMRM',
            text: 'Liên kết giữa Trường Đại học Quốc gia Hà Nội và Trường Đại học MIRAMAR Bang California - Mỹ'
        },
        {
            id: 'THKTHN',
            text: 'Trường Trung học Kinh tế Hà Nội'
        },
        {
            id: 'DTNCKH',
            text: ' Trung tâm Đào tạo và NCKH Ngân hàng'
        },
        {
            id: 'CDNVHN',
            text: 'Trường Cao đẳng Nội vụ Hà Nội'
        },
        {
            id: 'TCKTI',
            text: 'Trường Trung học Tài chính Kế toán I'
        },
        {
            id: 'DHTN',
            text: 'Trường Đại học Thương nghiệp'
        },
        {
            id: 'TTKTD',
            text: 'Trường Đại học Thông tin Kỹ thuật Điện NOVOSIBIRSK - Liên Xô'
        },
        {
            id: 'BKCNM',
            text: 'Liên kết giữa Trường Đại học Bách khoa Hà Nội và Trường Đại học Chuyên ngành Nam California Mỹ'
        },
        {
            id: 'TMDLHN',
            text: 'Trường Trung học Thương mại Du lịch Hà Nội'
        },
        {
            id: 'QGIMPAC',
            text: 'Liên kết giữa Trường Đại học Quốc gia Hà Nội và Trường Đại học IMPAC - Hoa Kỳ'
        },
        {
            id: 'KTYTTWI',
            text: 'Trường Trung học Kỹ thuật Y tế Trung ương I'
        },
        {
            id: 'TTDN277',
            text: 'Trung tâm Dạy nghề 27-7'
        },
        {
            id: 'NVDLHN',
            text: 'Trường Trung học Nghiệp vụ Du lịch Hà Nội'
        },
        {
            id: 'CNBDTN',
            text: 'Trường Công nhân Bưu điện miền núi Thái Nguyên'
        },
        {
            id: 'DHHHT',
            text: 'Trường Đại học Hà Hoa Tiên'
        },
        {
            id: 'CNTTTN',
            text: 'Trường Đại học Công nghệ Thông tin và Truyền thông Thái Nguyên'
        },
        {
            id: 'YTLC',
            text: 'Trường Trung học Y tế Lai Châu'
        },
        {
            id: 'THKTB',
            text: 'Trường Đại học Tổng hợp Kỹ thuật Berlin - CHLB Đức'
        },
        {
            id: 'GTVTST',
            text: 'Sở Giao thông Vận tải tỉnh Sóc Trăng'
        },
        {
            id: 'DTBCVT2',
            text: 'Trung tâm Đào tạo Bưu chính Viễn thông 2'
        },
        {
            id: 'KTKTCN2',
            text: 'Trường Cao đẳng Kinh tế Kỹ thuật CN II'
        },
        {
            id: 'DHKTHCM',
            text: 'Trường Đại học Kỹ thuật TP. HCM'
        },
        {
            id: 'TCKTHCM',
            text: 'Trường Đại học Tài chính Kế toán TP. HCM'
        },
        {
            id: 'CNTTSG',
            text: 'Trường Trung học Dân lập Công nghệ thông tin Sài Gòn'
        },
        {
            id: 'KTKTBL',
            text: 'Trường Trung học Kinh tế Kỹ thuật Bạc Liêu'
        },
        {
            id: 'KTKTCT',
            text: 'Trường Trung học Kinh tế Kỹ thuật Cần Thơ'
        },
        {
            id: 'KTCT',
            text: 'Trường Trung học Kỹ thuật Cần Thơ'
        },
        {
            id: 'CNPMCT',
            text: 'Trung tâm Công nghệ Phần mềm TP Cần Thơ'
        },
        {
            id: 'APTDBSCL',
            text: 'Trung tâm Aptech Đồng Bằng Sông Cửu Long'
        },
        {
            id: 'CNKTCT',
            text: 'Trường Trung cấp Công nghệ Kỹ thuật Cần thơ'
        },
        {
            id: 'NVPTTT',
            text: 'Trường Nghiệp vụ Phát thanh Truyền hình TP. HCM'
        },
        {
            id: 'BKMATI',
            text: 'Liên kết giữa Trường Đại học Bách khoa Hà Nội và Trường Đại học Công nghệ Quốc gia Nga TSIONKOVSKY (MATI)'
        },
        {
            id: 'ASTON',
            text: 'Trường Đại học ASTON - Vương Quốc Anh'
        },
        {
            id: 'KTQTCCA',
            text: 'Viện Kế toán Quản trị Công chứng Anh - Vương Quốc Anh'
        },
        {
            id: 'LDVQA',
            text: 'Trường Đại học London Metropolitan - Vương quốc Anh'
        },
        {
            id: 'CLNY',
            text: 'Trường Đại học Công lập New York tại Binghamton - Mỹ'
        },
        {
            id: 'BDTD',
            text: 'Trường Bưu Điện Thủ Đức'
        },
        {
            id: 'CCNHHCM',
            text: 'Trường Cao cấp Ngân hàng TP. HCM'
        },
        {
            id: 'CDSPDN',
            text: 'Trường Cao đẳng Sư phạm Đồng Nai'
        },
        {
            id: 'CN4DN',
            text: 'Trường Cao đẳng Công nghiệp 4 Đồng Nai'
        },
        {
            id: 'CDMKT',
            text: 'Trường Cao đẳng Marketing'
        },
        {
            id: 'CNBDTG',
            text: 'Trường Công nhân Bưu điện III Tiền Giang'
        },
        {
            id: 'DNQK9',
            text: 'Trường Dạy nghề Quân Khu 9'
        },
        {
            id: 'LEYTE',
            text: 'Trường Đại học Bang miền Nam LEYTE'
        },
        {
            id: 'DHKT',
            text: 'Trường Đại học Kỹ thuật'
        },
        {
            id: 'LHDN',
            text: 'Trường Đại học Lạc Hồng Đồng Nai'
        },
        {
            id: 'LNHCM',
            text: 'Trường Đại học Lâm Nghiệp TP. HCM'
        },
        {
            id: 'DHSPDN',
            text: 'Trường Đại học Sư phạm Đồng Nai'
        },
        {
            id: 'TDTT2',
            text: 'Trường Đại học Thể dục Thể thao 2'
        },
        {
            id: 'DHTHHCM',
            text: 'Trường Đại học Tổng hợp TP. HCM'
        },
        {
            id: 'BCVTDN',
            text: 'Học viện Công nghệ Bưu chính Viễn Thông - Đà Nẵng'
        },
        {
            id: 'TKTW2',
            text: 'Trường Trung cấp Thống kê Trung ương 2'
        },
        {
            id: 'THKT',
            text: 'Trường Trung học Kinh tế'
        },
        {
            id: 'CNBDII',
            text: 'Trường Công nhân Bưu điện II'
        },
        {
            id: 'CNKTCD',
            text: 'Trường Công nhân Kỹ thuật Cơ điện'
        },
        {
            id: 'KTKTTD',
            text: 'Trường Kinh tế Kỹ thuật - Thủ Đức'
        },
        {
            id: 'CDXD',
            text: 'Trường Trung học và Dạy nghề Cơ điện Xây dựng Nông nghiệp và Phát triển nông thôn'
        },
        {
            id: 'OHIO',
            text: 'Trường Đại học Quốc gia Ohio - Mỹ'
        },
        {
            id: 'WESLEYAN',
            text: 'Trường Đại học Ohio Wesleyan - Mỹ'
        },
        {
            id: 'CLTQ',
            text: 'Trường Đại học Cát Lâm - Trung Quốc'
        },
        {
            id: 'QGQTKD',
            text: 'Liên kết giữa Trường Đại học Quốc gia Hà Nội và Viện Quản trị Kinh doanh Bruxelles - Bỉ'
        },
        {
            id: 'THDT',
            text: 'Trường THCS Đông Thạnh'
        },
        {
            id: 'LQDHCM',
            text: 'Trường THPT Lê Quý Đôn - TP. HCM'
        },
        {
            id: 'THDDN',
            text: 'Trường THCS Trần Hưng Đạo - Đồng Nai'
        },
        {
            id: 'KTNVBH',
            text: 'Trường Trung học Kỹ thuật - Nghiệp vụ Biên Hòa'
        },
        {
            id: 'BTVHDN',
            text: 'Trường Bổ túc Văn hóa Dân Chính Đồng Nai'
        },
        {
            id: 'KTCNI',
            text: 'Trường Cao đẳng Kỹ thuật Công nghiệp I'
        },
        {
            id: 'CNTHDN',
            text: 'Trường Trung cấp Công nghệ Tin học - Viễn thông Đồng Nai'
        },
        {
            id: 'CTDN',
            text: 'Trường Chính trị Tỉnh Đồng Nai'
        },
        {
            id: 'FULDA',
            text: 'Đại học Fulda'
        },
        {
            id: 'SHU-TE',
            text: 'Đại học SHU-TE'
        },
        {
            id: 'CDKS',
            text: 'Trường Cao đẳng Kiểm sát'
        },
        {
            id: 'VNCTM',
            text: 'Viện nghiên cứu thương mại'
        },
        {
            id: 'MATI',
            text: 'Đại học MaTi - Nga'
        },
        {
            id: 'LEED',
            text: 'Đại học Leeds Metropolitan'
        },
        {
            id: 'NIIT',
            text: 'Học viện Công nghệ thông tin NIIT'
        },
        {
            id: 'WMT',
            text: 'Trường Đại học WESTMINSTER - Vương quốc Anh'
        },
        {
            id: 'HNN',
            text: 'Trường Trung học Kinh tế Hà Nam Ninh'
        },
        {
            id: 'THYTBM',
            text: 'Trường Trung học Y tế Bạch Mai'
        },
        {
            id: 'BKSGP',
            text: 'Liên kết giữa Trường Đại học Bách khoa Hà Nội và Trường Máy tính Genetic - Singapore'
        },
        {
            id: 'SQTC',
            text: 'Trường Sĩ quan Tài chính'
        },
        {
            id: 'DHSPV',
            text: 'Trường Đại học Sư phạm Vinh'
        },
        {
            id: 'CDLDXH',
            text: 'Trường Cao đẳng Lao động Xã hội'
        },
        {
            id: 'VHNTQD',
            text: 'Trường Cao đẳng Văn hóa Nghệ thuật Quân đội'
        },
        {
            id: 'THCNN',
            text: 'Trường Đại học Tổng hợp Công nghệ Quốc gia Nga'
        },
        {
            id: 'KTTTLLLX',
            text: 'Trường Đại học Kỹ thuật Thông tin liên lạc Matxcơva - Liên Xô'
        },
        {
            id: 'MACQUARIE',
            text: 'Trường Đại học Macquarie, Úc'
        },
        {
            id: 'SPHH',
            text: 'Cao đẳng sư phạm nhạc hoạ trung ương'
        },
        {
            id: 'CDCNDM',
            text: 'Liên kết giữa Trường Cao đẳng Công nghiệp Hà Nội và Viện Douglas Mawson - Ôxtrâylia'
        },
        {
            id: 'QGAILEN',
            text: 'Trường Đại học Quốc gia Ailen'
        },
        {
            id: 'TCKTQN',
            text: 'Trường Đại học Tài chính Kế toán - Quảng Ngãi'
        },
        {
            id: 'SQTTG',
            text: 'Trường Sỹ quan tăng thiết giáp'
        },
        {
            id: 'NMH',
            text: 'Trường Đại học Birmingham - Vương quốc Anh'
        },
        {
            id: 'DHLJM',
            text: 'Trường Đại học Liverpool John Moores'
        },
        {
            id: 'BEDFORDSHRIE',
            text: 'Trường Đại học Bedfordshrie - Vương quốc Anh'
        },
        {
            id: 'CARDIFF',
            text: 'Trường Đại học Cardiff Metropolitan - Vương quốc Anh'
        },
        {
            id: 'AUSTONSGP',
            text: 'Học viện Công nghệ và Quản lý Auston - Singapore'
        },
        {
            id: 'ASSUMPTION',
            text: 'Trường Đại học Assumption - Thái Lan'
        },
        {
            id: 'NHSDL',
            text: 'Liên kết giữa Học viện Ngân hàng và University of Sunderland - Anh Quốc'
        },
        {
            id: 'MIRAMAR',
            text: 'Trường Đại học California Miramar'
        },
        {
            id: 'CDCNHN',
            text: 'Trường Cao đẳng Công nghiệp Hà Nội'
        },
        {
            id: 'KTQTKDDNG',
            text: 'Đại học Kinh tế và Quản trị kinh doanh Đà Nẵng'
        },
        {
            id: 'OXFORD',
            text: 'Đại học Oxford Brookes'
        },
        {
            id: 'TTLH',
            text: 'Trung tâm đào tạo Lạc Hồng'
        },
        {
            id: 'NEWCASTLE',
            text: 'Trường ĐH Newcastle (Úc)'
        },
        {
            id: 'LK2',
            text: 'Liên kết giữa Trường ĐH Bách khoa HN và Viện quốc gia bách khoa Grenoble'
        },
        {
            id: 'DHTS1',
            text: 'Trường Đại học Thủy sản Nha Trang'
        },
        {
            id: 'ĐHSPĐN',
            text: 'Trường Đại học Sư phạm Đà Nẵng'
        },
        {
            id: 'CĐCN IV',
            text: 'Trường CĐ công nghiệp IV'
        },
        {
            id: 'TDTP',
            text: 'Trường chính trị Trần Phú'
        },
        {
            id: 'THTW',
            text: 'Trường Tuyên huấn Trung ương'
        },
        {
            id: 'THĐC',
            text: 'Trường Trung học Địa chính Trung ương III'
        },
        {
            id: 'TCKTBT',
            text: 'Trường Trung cấp kỹ thuật Bến Tre'
        },
        {
            id: 'PTTHBT',
            text: 'Trường Trung học Phát thanh Truyền hình'
        },
        {
            id: 'DHTDTT',
            text: 'Trường Đại học Thể dục Thể thao'
        },
        {
            id: 'NAQ',
            text: 'Trường Nguyễn Ái Quốc II'
        },
        {
            id: 'TKTWII',
            text: 'Trường thống kê TW II'
        },
        {
            id: 'THKTDNBL',
            text: 'Trung hoc kỹ thuật dạy nghề Bảo Lộc'
        },
        {
            id: 'CTKVII',
            text: 'Trường Học viện Chính trị Khu vực II'
        },
        {
            id: 'TKTL',
            text: 'Trường Kinh tế Luật'
        },
        {
            id: 'TDBT',
            text: 'Trường Đảng tỉnh Bến Tre'
        },
        {
            id: 'TSQLQ',
            text: 'Trường Sĩ quân lục quân 2'
        },
        {
            id: 'VTLT',
            text: 'Trường Trung cấp Văn thư Lưu trữ Tp.HCM'
        },
        {
            id: 'THAN',
            text: 'Trường Trung học An Ninh'
        },
        {
            id: 'ĐHLN',
            text: 'Đại học Nông Lâm Nghiệp'
        },
        {
            id: 'KTKTBTE',
            text: 'Trường Trung học Kinh tế Kỹ thuật Bến Tre'
        },
        {
            id: 'DHLDL',
            text: 'Trường Đại học Luật Đà Lạt'
        },
        {
            id: 'KTTC',
            text: 'Trường Cán bộ Khí tượng thủy văn TP.HCM'
        },
        {
            id: 'CN4',
            text: 'Trường Cao đẳng Công nghiệp 4 HCM'
        },
        {
            id: 'CDSPBTE',
            text: 'Trường Cao đẳng Sư phạm Bến Tre'
        },
        {
            id: 'CDSPKTKT',
            text: 'Trường Sư phạm Kinh tế Kỹ thuật Vĩnh Long'
        },
        {
            id: 'TDC',
            text: 'Trường Trung học Kỹ Thuật và Nghiệp Vụ Thủ Đức'
        },
        {
            id: 'THKTCNBT',
            text: 'Trường Trung học Kỹ thuật Công nghiệp Bến Tre'
        },
        {
            id: 'TPO_CSDT_3',
            text: 'Đại học Dân lập Ngoại ngữ - Tin học TP Hồ Chí Minh'
        },
        {
            id: 'TPO_CSDT_4',
            text: 'Trung tâm Giáo dục thường xuyên tỉnh Bến Tre'
        },
        {
            id: 'HM',
            text: 'Trường Đại học Hawaii, USA'
        },
        {
            id: 'TTYT',
            text: 'Trung tâm y tế Ba Tri'
        },
        {
            id: 'ĐHYKHUE',
            text: 'Trường đại học y khoa Huế'
        },
        {
            id: 'HVNIIT',
            text: 'Học viện quốc tế NIIT'
        },
        {
            id: 'HVHLKHXH',
            text: 'Học viện Hàn lâm khoa học xã hội'
        },
        {
            id: 'KTYTTW3',
            text: 'Trường Kỹ thuật Y tế Trung ương III'
        },
        {
            id: '00070',
            text: 'Viện nghiên cứu khoa Y Dược Lâm sàng 108'
        },
        {
            id: 'AIT',
            text: 'Viện kỹ thuật Châu Á'
        },
        {
            id: 'OUM',
            text: 'Đại học Mở Malaysia'
        },
        {
            id: 'HVCT4',
            text: 'Học viện chính trị khu vực IV'
        },
        {
            id: 'TCTL3',
            text: 'Trường Trung cấp Thuỷ lợi 3'
        },
        {
            id: 'CADASA',
            text: 'Trường Điện toán và ngoại ngữ Cadasa'
        },
        {
            id: 'THTKTW2',
            text: 'Trường Trung học Thống kê TW 2'
        },
        {
            id: '2643-VTLT',
            text: 'CTCP Giáo dục Việt Nam'
        },
        {
            id: 'CDMT',
            text: 'Trường Cao Đẳng Xây dựng Miền Tây'
        },
        {
            id: 'HVYHDT',
            text: 'Học viện y học dân tộc TPHCM'
        },
        {
            id: '1221',
            text: 'Trường Trung học Lao động Thương binh và Xã hội'
        },
        {
            id: 'TCYT',
            text: 'TCYT Đặng Văn Ngữ'
        },
        {
            id: 'NG',
            text: 'Trường Cao Đẳng Nguyễn Tất Thành'
        },
        {
            id: 'TH',
            text: 'Trường Trung học Văn hoá nghệ thuật Bến Tre'
        },
        {
            id: 'TTCT',
            text: 'Trung tâm bồi dưỡng Chính trị huyện'
        },
        {
            id: 'SPĐT',
            text: 'Trường Đại học Sư phạm Đồng Tháp'
        },
        {
            id: 'ĐHCC',
            text: 'Trường Đại học Y tế Công cộng Hà Nội'
        },
        {
            id: 'HB',
            text: 'Trường Đại học Hồng Bàng'
        },
        {
            id: '1578',
            text: 'Trung tâm huấn luyện cán bộ Y tế quân khu 9 Cần Thơ'
        },
        {
            id: 'SPKTSCĐ',
            text: 'Trường sư phạm kỹ thuật Vĩnh Long IV'
        },
        {
            id: 'QK9',
            text: 'Trường kỹ thuật quân khu 9'
        },
        {
            id: 'THQY',
            text: 'Trường Trung Học Quân Y II'
        },
        {
            id: 'THYT CT',
            text: 'Trường Trung cấp y tế Cần Thơ'
        },
        {
            id: 'CNKTCL',
            text: 'Trường Trung cấp Công nghệ Kỹ thuật Cửu Long'
        },
        {
            id: 'TCPN',
            text: 'Trường Trung Cấp Phương Nam'
        },
        {
            id: 'TTĐT',
            text: 'Trung tâm đào tạo và bồi dưỡng y tế TP HCM'
        },
        {
            id: 'VTLT2',
            text: 'trường trung học văn thư lưu trữ trung ương I'
        },
        {
            id: 'VTLLT2',
            text: 'Trung học văn thư lưu trữ trung ương II'
        },
        {
            id: 'THYTVL',
            text: 'Trường Trung học Y tế Vĩnh Long'
        },
        {
            id: 'TTHYTTG',
            text: 'Trường trung học y tế Tiền Giang'
        },
        {
            id: 'TP HCM',
            text: 'Viện Pasteur TP HCM'
        },
        {
            id: 'CBCC',
            text: 'Trường Đào tạo, Bồi dưỡng CBCC'
        },
        {
            id: 'THYDDT',
            text: 'Trường THYDDT Thành phố HCM'
        },
        {
            id: 'TCQY2',
            text: 'Trung cấp Quân Y 2 Quận 9 Thành phố Hồ Chí Minh'
        },
        {
            id: 'ĐHCNTP',
            text: 'Trường Đại học Công nghệ Thực phẩm TP.HCM'
        },
        {
            id: 'TR-KTT',
            text: 'Trường Kinh tế lao động và bảo trợ xã hội'
        },
        {
            id: 'TC',
            text: 'Trường Trung cấp Kinh tế Kỹ Thuật Bến Tre'
        },
        {
            id: 'HVHCII',
            text: 'Học Viện hành chính khu vực II'
        },
        {
            id: 'PTNT',
            text: 'Trường Cán bộ QLNN và PTNTII'
        },
        {
            id: 'VYTCC',
            text: 'Viện Y tế công cộng'
        },
        {
            id: 'THPT',
            text: 'Trường THPT Bán công Thị xã'
        },
        {
            id: 'TTHTPT',
            text: 'Trung tâm Hỗ trợ và Phát triển công nghệ thông tin - CADIT'
        },
        {
            id: 'VT03',
            text: 'Trường Trung học Bưu chính viễn thông và CNTT 3'
        },
        {
            id: 'TVTLT',
            text: 'Trường Văn thư - Lưu trữ II'
        },
        {
            id: 'PNT',
            text: 'Trường đại học Phạm Ngọc Thạch'
        },
        {
            id: '002',
            text: 'Trường Trung học Lưu trữ và Nghiệp vụ Văn phòng II'
        },
        {
            id: 'CĐSPKT',
            text: 'Trường CĐSP kỹ thuật Vĩnh Long'
        },
        {
            id: 'TCTT',
            text: 'Trung cấp Trồng trọt Bảo vệ thực vật - Tiền Giang'
        },
        {
            id: 'TDHBCTDT',
            text: 'Trường Đại học Bán Công Tôn Đức Thắng'
        },
        {
            id: 'NNLD',
            text: 'Trường Trung học kỹ thuật Nông nghiệp Long Định'
        },
        {
            id: 'GDTXTG',
            text: 'Trung tâm GDTX Tỉnh Tiền Giang'
        },
        {
            id: 'CĐKTKTVL',
            text: 'Trường cao đẳng kinh tế kỹ thuật Vĩnh Long'
        },
        {
            id: 'TTHKTTU3',
            text: 'Trường Trung học Kỹ thuật Y tế Trung ương 3'
        },
        {
            id: 'THKTHSTW1',
            text: 'Trường TH kỹ thuật hải sản TW1 Hải Phòng'
        },
        {
            id: 'THKTNVTS2',
            text: 'Trường Trung học kỷ thuật NV Thủy sản 2 TPHCM'
        },
        {
            id: 'TJUTCM',
            text: 'Đại học Trung Y Dược Thiên Tân, Trung Quốc'
        },
        {
            id: 'THLD',
            text: 'Trường Trung học Nông nghiệp Long Định'
        },
        {
            id: 'ĐHTS',
            text: 'Trường Đại học Thủy sản'
        },
        {
            id: 'THPTTH2',
            text: 'Trường Trung học Phát thanh Truyền hình 2'
        },
        {
            id: 'THTS1',
            text: 'Trường Trung học Thủy sản 1'
        },
        {
            id: 'TCDN',
            text: 'Tổng cục dạy nghề'
        },
        {
            id: 'THTC',
            text: 'Trường Trung học Tài chính Kế toán IV'
        },
        {
            id: 'CNKT3',
            text: 'Trường Công nhân kỹ thuật lâm nghiệp số 3'
        },
        {
            id: 'TRUONG',
            text: 'Trường Trung học hàng Hải 2'
        },
        {
            id: 'THHH2',
            text: 'Trường NV Quản lý khoa học và Công nghệ'
        },
        {
            id: 'TNVQLKHCN',
            text: 'Trường Quân sự quân khu 9'
        },
        {
            id: 'SD',
            text: 'Trường trung học kinh tế Bến Tre'
        },
        {
            id: 'TTKTBT',
            text: 'Trường Trung học Y Dược dân tộc TP.HCM Cơ Quan Thú y vùng VI'
        },
        {
            id: 'YDDT',
            text: 'Viện đào tạo STEC'
        },
        {
            id: 'CQV6',
            text: 'Trung tâm Khuyến nông Quốc Gia'
        },
        {
            id: 'STEC',
            text: 'Viện KHKT Nông Lâm nghiệp miền núi Phía Bắc'
        },
        {
            id: 'TTKNQG',
            text: 'Trường Trung học lao động xã hội'
        },
        {
            id: 'VKHKT',
            text: 'TRUONG THNVTSHCM'
        },
        {
            id: 'THLDXH',
            text: 'Trường Trung học Nghiệp vụ thủy sản TPHCM'
        },
        {
            id: '10003',
            text: 'Trung tâm GDTX Châu Thành, Tiền Giang'
        },
        {
            id: 'T49',
            text: 'Trường Cảnh sát nhân dân III'
        },
        {
            id: 'WEW',
            text: 'Phân hiệu học viện Phụ nữ'
        },
        {
            id: 'VNCCAQMN',
            text: 'Viện Nghiên cứu CAQ Miền Nam'
        },
        {
            id: 'THLN',
            text: 'Trường Trung học Lâm nghiệp Trung ương 4'
        },
        {
            id: '10006',
            text: 'Trường THPT Bán Công A Châu Thành'
        },
        {
            id: '100071',
            text: 'Trường Cán bộ Phụ nữ Trung ương'
        },
        {
            id: 'TCN',
            text: 'Trường Trung Cấp Nghề Bến Tre'
        },
        {
            id: 'ĐHKTTC',
            text: 'Trường Đại học Kế toán chính TPHCM'
        },
        {
            id: 'THCT',
            text: 'Trường trung học kỹ thuật Cao Thắng'
        },
        {
            id: 'LN2',
            text: 'Trường trung học lâm nghiệp số 2'
        },
        {
            id: 'PLHN',
            text: 'Trường Đại học pháp lý Hà Nội'
        },
        {
            id: 'CDMGTW3',
            text: 'Trường CĐ Sư phạm Mẫu giáo TW3'
        },
        {
            id: 'THGTVT',
            text: 'Trường trung học giao thông vận tải khu vực 3'
        },
        {
            id: 'QDY2',
            text: 'Trường trung học quân dân y 2'
        },
        {
            id: 'THYTCLG',
            text: 'Trường trung học y tế cửu Long'
        },
        {
            id: 'THANND',
            text: 'Trường Trung học An ninh nhân dân 2'
        },
        {
            id: 'THCNT',
            text: 'Trường Trung học chuyên nghiệp Tỉnh'
        },
        {
            id: 'CDSPCT',
            text: 'Trường CĐ Sư phạm Cần Thơ'
        },
        {
            id: 'CDSPTG',
            text: 'Trường CĐ Sư phạm Tiền Giang'
        },
        {
            id: 'HVQHQT',
            text: 'Học viện Quan hệ Quốc tế'
        },
        {
            id: 'THMGT',
            text: 'Trường Trung học Mẫu giáo Tỉnh'
        },
        {
            id: 'CDSPDAN',
            text: 'Trường Cao đẳng sư phạm Đà Nẵng'
        },
        {
            id: 'CDSPAG',
            text: 'Trường CĐ Sư phạm An Giang'
        },
        {
            id: 'CDSPDT',
            text: 'Trường CĐ Sư phạm Đồng Tháp'
        },
        {
            id: 'CDTDTW1',
            text: 'Trường CĐ Sư phạm Thể dục TW1'
        },
        {
            id: 'TTHYTAG',
            text: 'Trường Trung học Y tế An Giang'
        },
        {
            id: 'THSPVL',
            text: 'Trường Trung học sư phạm Vĩnh Long'
        },
        {
            id: 'THSPTG',
            text: 'Trường Trung học sư phạm Tiền Giang'
        },
        {
            id: 'KHKT_DN',
            text: 'Trường ĐH Kỹ thuật - ĐH Đà Nẵng'
        },
        {
            id: 'KTCNII',
            text: 'Trường CĐ Kinh tế -Kỹ thuật CN II'
        },
        {
            id: 'CDSPBL',
            text: 'Trường CĐ Sư phạm Bạc Liêu'
        },
        {
            id: 'DTBDCBYT',
            text: 'Trung tâm Đào tạo bồi dưỡng cán bộ Y tế'
        },
        {
            id: 'DHV',
            text: 'Trường Đại học Dân lập Hùng Vương - Tp Hồ Chí Minh'
        },
        {
            id: 'CDSPTV',
            text: 'Trường CĐ Sư phạm Trà Vinh'
        },
        {
            id: 'QLCBTW2',
            text: 'Trường Cán bộ quản lý GD&ĐT TW 2'
        },
        {
            id: 'CTU',
            text: 'Đại học Cần Thơ'
        },
        {
            id: 'TCCN',
            text: 'Trung cấp chuyên nghiệp dân lập công nghệ tin học viễn thông Đồng Nai'
        },
        {
            id: 'MAHIDOL',
            text: 'Trường Đại học Mahidol'
        },
        {
            id: 'SUN',
            text: 'Sun Microsystems Inc.'
        },
        {
            id: 'AOTS_HCM',
            text: 'The Association for Overseas Technical Scholarship (Hiệp hội học bổng công nghệ nước ngoài của Nhật - AOTS) và Sở Khoa học và Cô'
        },
        {
            id: 'CICC_BKHC',
            text: 'Center for The International Cooperation for computerization, Japan (Trung tâm hợp tác quốc tế về tin học của Nhật – CICC) và Bộ'
        },
        {
            id: 'DNPACE',
            text: 'Trường Doanh nhân PACE'
        },
        {
            id: 'VCLTTTT',
            text: 'Đại sứ quán Israel và Viện Chiến lược Thông tin và Truyền thông '
        },
        {
            id: 'MICROSOFT',
            text: 'Microsoft'
        },
        {
            id: 'UDCNTT',
            text: 'Cục ứng dụng công nghệ thông tin - Bộ Thông tin và Truyền thông '
        },
        {
            id: 'QTKD',
            text: 'Viện quản trị doanh nghiệp Thành phố Hồ Chí Minh'
        },
        {
            id: 'CDTG',
            text: 'Trường Cao Đẳng Cộng Đồng Tiền Giang'
        },
        {
            id: 'TCNV',
            text: 'Trường Trung cấp nghiệp vụ kế hoạch III'
        },
        {
            id: 'QSBT',
            text: 'Trường Quân sự tỉnh Bến Tre'
        },
        {
            id: 'CDKTVL',
            text: 'Trường Cao Đẳng Kỹ Thuật Vĩnh Long'
        },
        {
            id: 'CDSPKTIV',
            text: 'Trường Cao Đẳng Sư Phạm Kỹ Thuật Vĩnh Long'
        },
        {
            id: 'TBTĐ',
            text: 'Trường DN Thương Binh Thủ Đức'
        },
        {
            id: 'TCKT',
            text: 'Trường TH Tài Chánh Kế Toán IV'
        },
        {
            id: 'CDNDK',
            text: 'Trường Cao đẳng Nghề Đồng Khởi Bến Tre'
        },
        {
            id: 'THTL',
            text: 'Trường Trung học Thủy lợi 3 - Tiền Giang'
        },
        {
            id: 'THS8',
            text: 'Trường Trung học số 8'
        },
        {
            id: 'THXDS8',
            text: 'Trường Trung học xây dựng số 8'
        },
        {
            id: 'DLKT',
            text: 'Trường Đại học Dân lập Kỹ thuật Công nghệ'
        },
        {
            id: 'SHU',
            text: 'Sheffield Hallam University'
        },
        {
            id: 'CDT026',
            text: 'Cao đẳng Giao Thông Vận Tải Trung ương 6'
        },
        {
            id: '909',
            text: 'Trường Trung cấp Văn thư lưu trữ Trung ương II'
        },
        {
            id: 'CDCNLadec',
            text: 'Trường cao đẳng công nghệ Ladec'
        },
        {
            id: 'HVVN',
            text: 'Học viện khoa học giáo dục Việt Nam'
        },
        {
            id: 'HVCTQGHCM',
            text: 'Học viện Chính trị Quốc gia Hồ Chí Minh'
        },
        {
            id: 'Victoria',
            text: 'Trường Đại học Victoria (Úc)'
        },
        {
            id: 'LL-PPDH',
            text: 'Lý luận và Phương pháp dạy học tiếng Anh'
        },
        {
            id: 'DHRouen',
            text: 'Trường Đại học Rouen (Pháp)'
        },
        {
            id: 'TCDL_VT',
            text: 'Trường Trung cấp Du lịch Vũng Tàu'
        },
        {
            id: 'HCMA',
            text: 'Học viện Chính trị - Hành chính khu vực II TP Hồ Chí Minh'
        },
        {
            id: 'CĐCTBT',
            text: 'Trường Cao đẳng Chính trị Bến Tre'
        },
        {
            id: 'TCSPBT',
            text: 'Trường Trung học sư phạm Bến Tre'
        },
        {
            id: 'TCSPBRVT',
            text: 'Trường Trung cấp Sư phạm Bà Rịa - Vũng Tàu'
        },
        {
            id: 'CDKTKTCNII',
            text: 'Trường Cao đẳng Kinh tế Kỹ thuật Công nghiệp II'
        },
        {
            id: 'TCSPBTE',
            text: 'Trường Trung cấp Sư phạm Bến Tre'
        },
        {
            id: 'YDSG',
            text: 'Trường Cao đẳng y dược Sài Gòn'
        },
        {
            id: 'TCTBT',
            text: 'Trường Chính trị Bến Tre'
        },
        {
            id: 'TCTH',
            text: 'Trường trung cấp tổng hợp TP.HCM'
        },
        {
            id: 'CDT3503',
            text: 'Trường Cao đẳng sư phạm Quảng Ngãi'
        },
        {
            id: 'QNC',
            text: 'Trường Cao đẳng Quảng Ngãi'
        },
        {
            id: '052',
            text: 'Trung tâm Giáo dục thường xuyên tỉnh Bình Định'
        },
        {
            id: 'FUV',
            text: 'Trường Đại học Fulbright Việt Nam'
        },
        {
            id: 'LTU',
            text: 'Trường Đại học La Trobe'
        },
        {
            id: 'UQ',
            text: 'Trường Đại học Queensland (UQ)'
        },
        {
            id: 'MSU',
            text: 'Trường Đại học Mahasarakham (MSU)'
        },
        {
            id: 'GXUN',
            text: 'Trường Đại học Quảng Tây (Guangxi University)'
        },
        {
            id: 'JCU',
            text: 'Trường Đại học James Cook (JCU)'
        },
        {
            id: 'UOG',
            text: 'Trường Đại học Gloucestershire (UoG)'
        },
        {
            id: 'TCBD',
            text: 'Trường chính trị tỉnh Bình Định'
        },
        {
            id: 'BKG',
            text: 'Ban Tuyên giáo - Đảng ủy Khối các cơ quan tỉnh'
        },
        {
            id: 'CTGL',
            text: 'Trường Chính trị tỉnh Gia Lai'
        },
        {
            id: 'VQA',
            text: 'Trường Đại học Gloucesthershire (Vương quốc Anh)'
        },
        {
            id: 'GDTXCM',
            text: 'Trung tâm Giáo dục thường xuyên tỉnh Cà Mau'
        },
        {
            id: 'NVCUQN',
            text: 'Trường Đào tạo cán bộ Nguyễn Văn Cừ'
        },
        {
            id: 'CTSL',
            text: 'Trường Chính trị Tỉnh Sơn La'
        },
        {
            id: 'H52.06.06',
            text: 'Trung tâm giáo dục thường xuyên tỉnh Sơn La'
        },
        {
            id: 'CTHDGCB',
            text: 'Trường chính trị Hoàng Đình Giong tỉnh Cao Bằng'
        },
        {
            id: 'VUSTA',
            text: 'Liên hiệp các hội khoa học và kỹ thuật Việt Nam'
        },
        {
            id: 'HVCT',
            text: 'Học viện Chính trị'
        },
        {
            id: 'TTNNTHVT',
            text: 'Trung tâm Ngoại ngữ Tin học Vũng Tàu'
        },
        {
            id: 'TTNNTHV',
            text: 'Trung tâm Ngoại ngữ - Tin học Victory'
        },
        {
            id: 'TTGDTTBR',
            text: 'Trung tâm giáo dục thường xuyên tỉnh Bà Rịa Vũng Tàu'
        },
        {
            id: 'IDECAF',
            text: 'Viện trao đổi văn hóa với Pháp'
        },
        {
            id: 'TTTHNTAC',
            text: 'Trung tâm tin học ngoại ngữ Quốc tế Á Châu'
        },
        {
            id: 'DHTC',
            text: 'Trường Đại học Tài chính - Marketing Cơ sở Thủ Đức'
        },
        {
            id: 'THYHCTTT',
            text: 'Trường trung học Y học cổ truyền Tuệ Tĩnh II'
        },
        {
            id: 'TTGDTXBD',
            text: 'Trung tâm Giáo dục thường xuyên và Bồi dưỡng nghiệp vụ tỉnh Bình Dương'
        },
        {
            id: 'TDLTT',
            text: 'Trường Đoàn Lý Tự Trọng'
        },
        {
            id: 'TCTCVDBL',
            text: 'Trường chính trị Châu Văn Đặng tỉnh Bạc Liêu'
        },
        {
            id: 'QSBD',
            text: 'Trường Quân sự tỉnh Bình Dương'
        },
        {
            id: 'THSPBRVT',
            text: 'Trung học Sư phạm Bà Rịa Vũng Tàu'
        },
        {
            id: 'THNNDN',
            text: 'Trường Trung học Nông nghiệp Đồng Nai'
        },
        {
            id: 'TCBQLHCM',
            text: 'Trường Cán bộ Quản lý Giáo dục thành phố Hồ Chí Minh'
        },
        {
            id: 'CTCPGDTCNKT',
            text: 'Công ty cổ phần giáo dục trường công nghiệp kỹ thuật - kinh tế đối ngoại'
        },
        {
            id: 'TTBDCTVT',
            text: 'Trung tâm bồi dưỡng chính trị thành phố Vũng Tàu'
        },
        {
            id: 'CDSPHT',
            text: 'Trường Cao Đẳng Sư Phạm Hà Tĩnh'
        },
        {
            id: 'CTTBRVT',
            text: 'Trường Chính trị tỉnh Bà Rịa Vũng Tàu'
        },
        {
            id: 'TCTTQ ',
            text: 'Trường Chính trị tỉnh Tuyên Quang'
        },
        {
            id: 'TCTNBH ',
            text: 'Trường Chính Trị Tỉnh Ninh Bình'
        },
        {
            id: 'TCTTN',
            text: 'Trưởng Chính Trị Tây Ninh'
        }
    ];

    const SelectAdapter_ChuyenNganhChuyenMon = [
        {
            id: '9210201',
            text: 'Âm nhạc học (9210201)'
        },
        {
            id: '6480219',
            text: 'An ninh mạng (6480219)'
        },
        {
            id: '5850201',
            text: 'An toàn lao động (5850201)'
        },
        {
            id: '5850111',
            text: 'An toàn phóng xạ (5850111)'
        },
        {
            id: '9480202',
            text: 'An toàn thông tin (9480202)'
        },
        {
            id: '9440212',
            text: 'Bản đồ học (9440212)'
        },
        {
            id: '9440214',
            text: 'Bản đồ, viễn thám và hệ thông tin địa lý (9440214)'
        },
        {
            id: '5340139',
            text: 'Bán hàng trong siêu thị (5340139)'
        },
        {
            id: '7320101',
            text: 'Báo chí (7320101)'
        },
        {
            id: '9320101',
            text: 'Báo chí học (9320101)'
        },
        {
            id: '7510211',
            text: 'Bảo dưỡng công nghiệp (7510211)'
        },
        {
            id: '6510111',
            text: 'Bảo dưỡng, sửa chữa công trình giao thông đường sắt đô thị (6510111)'
        },
        {
            id: '6520163',
            text: 'Bảo dưỡng, sửa chữa tàu điện (6520163)'
        },
        {
            id: '9340204',
            text: 'Bảo hiểm (9340204)'
        },
        {
            id: '6340205',
            text: 'Bảo hiểm xã hội (6340205)'
        },
        {
            id: '7850201',
            text: 'Bảo hộ lao động (7850201)'
        },
        {
            id: '5850202',
            text: 'Bảo hộ lao động và môi trường (5850202)'
        },
        {
            id: '6320309',
            text: 'Bảo tàng (6320309)'
        },
        {
            id: '9320305',
            text: 'Bảo tàng học (9320305)'
        },
        {
            id: '7580111',
            text: 'Bảo tồn di sản kiến trúc - đô thị (7580111)'
        },
        {
            id: '5320310',
            text: 'Bảo tồn và khai thác di tích, di sản lịch sử - văn hóa (5320310)'
        },
        {
            id: '5850108',
            text: 'Bảo tồn và phát triển đa dạng sinh học (5850108)'
        },
        {
            id: '6520154',
            text: 'Bảo trì hệ thống thiết bị cảng hàng không (6520154)'
        },
        {
            id: '6520151',
            text: 'Bảo trì hệ thống thiết bị cơ khí (6520151)'
        },
        {
            id: '6520155',
            text: 'Bảo trì hệ thống thiết bị công nghiệp (6520155)'
        },
        {
            id: '6520149',
            text: 'Bảo trì thiết bị cơ điện (6520149)'
        },
        {
            id: '6520269',
            text: 'Bảo trì thiết bị điện trong nhà máy điện hạt nhân (6520269)'
        },
        {
            id: '5520164',
            text: 'Bảo trì và sửa chữa đầu máy, toa xe (5520164)'
        },
        {
            id: '5520168',
            text: 'Bảo trì và sửa chữa hệ thống kỹ thuật vô tuyến khí tượng (5520168)'
        },
        {
            id: '5520160',
            text: 'Bảo trì và sửa chữa khung, vỏ ô tô (5520160)'
        },
        {
            id: '5520165',
            text: 'Bảo trì và sửa chữa máy bay (5520165)'
        },
        {
            id: '5520158',
            text: 'Bảo trì và sửa chữa máy công cụ (5520158)'
        },
        {
            id: '5520173',
            text: 'Bảo trì và sửa chữa máy mỏ và thiết bị hầm lò (5520173)'
        },
        {
            id: '5520171',
            text: 'Bảo trì và sửa chữa máy nông lâm nghiệp (5520171)'
        },
        {
            id: '5520166',
            text: 'Bảo trì và sửa chữa máy tàu thủy (5520166)'
        },
        {
            id: '5520169',
            text: 'Bảo trì và sửa chữa máy xây dựng và máy nâng chuyển (5520169)'
        },
        {
            id: '5520170',
            text: 'Bảo trì và sửa chữa máy, thiết bị công nghiệp (5520170)'
        },
        {
            id: '5520159',
            text: 'Bảo trì và sửa chữa ô tô (5520159)'
        },
        {
            id: '5520178',
            text: 'Bảo trì và sửa chữa thiết bị chế biến dầu khí (5520178)'
        },
        {
            id: '5520172',
            text: 'Bảo trì và sửa chữa thiết bị chế biến lương thực, thực phẩm (5520172)'
        },
        {
            id: '5520150',
            text: 'Bảo trì và sửa chữa thiết bị cơ điện (5520150)'
        },
        {
            id: '5520161',
            text: 'Bảo trì và sửa chữa thiết bị cơ giới hạng nặng (5520161)'
        },
        {
            id: '5520152',
            text: 'Bảo trì và sửa chữa thiết bị cơ khí (5520152)'
        },
        {
            id: '5520176',
            text: 'Bảo trì và sửa chữa thiết bị hóa chất (5520176)'
        },
        {
            id: '5510916',
            text: 'Biên chế bản đồ (5510916)'
        },
        {
            id: '7210243',
            text: 'Biên đạo múa (7210243)'
        },
        {
            id: '9440221',
            text: 'Biến đổi khí hậu (9440221)'
        },
        {
            id: '7210233',
            text: 'Biên kịch điện ảnh, truyền hình (7210233)'
        },
        {
            id: '7210225',
            text: 'Biên kịch sân khấu (7210225)'
        },
        {
            id: '9860215',
            text: 'Biên phòng (9860215)'
        },
        {
            id: '5210229',
            text: 'Biên tập và dàn dựng ca, múa, nhạc (5210229)'
        },
        {
            id: '7210207',
            text: 'Biểu diễn nhạc cụ phương tây (7210207)'
        },
        {
            id: '7210210',
            text: 'Biểu diễn nhạc cụ truyền thống (7210210)'
        },
        {
            id: '6520312',
            text: 'Cấp thoát nước (6520312)'
        },
        {
            id: '5520312',
            text: 'Cấp, thoát nước (5520312)'
        },
        {
            id: '6520121',
            text: 'Cắt gọt kim loại (6520121)'
        },
        {
            id: '6210409',
            text: 'Chạm khắc đá (6210409)'
        },
        {
            id: '6810404',
            text: 'Chăm sóc sắc đẹp (6810404)'
        },
        {
            id: '5760202',
            text: 'Chăm sóc và hỗ trợ gia đình (5760202)'
        },
        {
            id: '9620105',
            text: 'Chăn nuôi (9620105)'
        },
        {
            id: '5620119',
            text: 'Chăn nuôi - Thú y (5620119)'
        },
        {
            id: '6620116',
            text: 'Chăn nuôi gia súc, gia cầm (6620116)'
        },
        {
            id: '6620117',
            text: 'Chăn nuôi và chế biến thịt Bò (6620117)'
        },
        {
            id: '8310602',
            text: 'Châu Á học (8310602)'
        },
        {
            id: '5520180',
            text: 'Bảo trì và sửa chữa thiết bị in (5520180)'
        },
        {
            id: '5520177',
            text: 'Bảo trì và sửa chữa thiết bị khoan dầu khí (5520177)'
        },
        {
            id: '5520153',
            text: 'Bảo trì và sửa chữa thiết bị luyện kim (5520153)'
        },
        {
            id: '5520175',
            text: 'Bảo trì và sửa chữa thiết bị may (5520175)'
        },
        {
            id: '5520157',
            text: 'Bảo trì và sửa chữa thiết bị nhiệt (5520157)'
        },
        {
            id: '5520179',
            text: 'Bảo trì và sửa chữa thiết bị sản xuất các sản phẩm da (5520179)'
        },
        {
            id: '5520174',
            text: 'Bảo trì và sửa chữa thiết bị sợi - dệt (5520174)'
        },
        {
            id: '5520167',
            text: 'Bảo trì và sửa chữa thiết bị vô tuyến vận tải (5520167)'
        },
        {
            id: '5520181',
            text: 'Bảo trì và sửa chữa thiết bị y tế (5520181)'
        },
        {
            id: '5520162',
            text: 'Bảo trì và sửa chữa xe máy (5520162)'
        },
        {
            id: '6869002',
            text: 'Bảo vệ (6869002)'
        },
        {
            id: '6850106',
            text: 'Bảo vệ môi trường biển (6850106)'
        },
        {
            id: '6850105',
            text: 'Bảo vệ môi trường công nghiệp (6850105)'
        },
        {
            id: '6850104',
            text: 'Bảo vệ môi trường đô thị (6850104)'
        },
        {
            id: '9620112',
            text: 'Bảo vệ thực vật (9620112)'
        },
        {
            id: '7340116',
            text: 'Bất động sản (7340116)'
        },
        {
            id: '5580206',
            text: 'Bê tông (5580206)'
        },
        {
            id: '9620302',
            text: 'Bệnh học thủy sản (9620302)'
        },
        {
            id: '9640102',
            text: 'Bệnh lý học và chữa bệnh vật nuôi (9640102)'
        },
        {
            id: '9720109',
            text: 'Bệnh truyền nhiễm và các bệnh nhiệt đới (9720109)'
        },
        {
            id: '6540125',
            text: 'Chế biến cà phê, ca cao (6540125)'
        },
        {
            id: '6540105',
            text: 'Chế biến dầu thực vật (6540105)'
        },
        {
            id: '5540107',
            text: 'Chế biến hạt điều (5540107)'
        },
        {
            id: '6540102',
            text: 'Chế biến lương thực (6540102)'
        },
        {
            id: '6510538',
            text: 'Chế biến mủ cao su (6510538)'
        },
        {
            id: '6620105',
            text: 'Chế biến nông lâm sản (6620105)'
        },
        {
            id: '5540121',
            text: 'Chế biến nước quả cô đặc (5540121)'
        },
        {
            id: '6540106',
            text: 'Chế biến rau quả (6540106)'
        },
        {
            id: '5540109',
            text: 'Chế biến sữa (5540109)'
        },
        {
            id: '6540104',
            text: 'Chế biến thực phẩm (6540104)'
        },
        {
            id: '6540126',
            text: 'Chế biến thuốc lá (6540126)'
        },
        {
            id: '6620301',
            text: 'Chế biến và bảo quản thủy sản (6620301)'
        },
        {
            id: '6520105',
            text: 'Chế tạo khuôn mẫu (6520105)'
        },
        {
            id: '6520104',
            text: 'Chế tạo thiết bị cơ khí (6520104)'
        },
        {
            id: '7210204',
            text: 'Chỉ huy âm nhạc (7210204)'
        },
        {
            id: '5210228',
            text: 'Chỉ huy hợp xướng (5210228)'
        },
        {
            id: '7860228',
            text: 'Chỉ huy kỹ thuật Công binh (7860228)'
        },
        {
            id: '7860232',
            text: 'Chỉ huy kỹ thuật Hải quân (7860232)'
        },
        {
            id: '7860229',
            text: 'Chỉ huy kỹ thuật Hóa học (7860229)'
        },
        {
            id: '7860226',
            text: 'Chỉ huy kỹ thuật Phòng không (7860226)'
        },
        {
            id: '7860233',
            text: 'Chỉ huy kỹ thuật tác chiến điện tử (7860233)'
        },
        {
            id: '7860227',
            text: 'Chỉ huy kỹ thuật Tăng - thiết giáp (7860227)'
        },
        {
            id: '7860207',
            text: 'Chỉ huy tham mưu Đặc công (7860207)'
        },
        {
            id: '7860202',
            text: 'Chỉ huy tham mưu Hải quân (7860202)'
        },
        {
            id: '7860203',
            text: 'Chỉ huy tham mưu Không quân (7860203)'
        },
        {
            id: '7860201',
            text: 'Chỉ huy tham mưu Lục quân (7860201)'
        },
        {
            id: '7860205',
            text: 'Chỉ huy tham mưu Pháo binh (7860205)'
        },
        {
            id: '7860204',
            text: 'Chỉ huy tham mưu Phòng không (7860204)'
        },
        {
            id: '7860206',
            text: 'Chỉ huy tham mưu Tăng - thiết giáp (7860206)'
        },
        {
            id: '7860220',
            text: 'Chỉ huy tham mưu thông tin (7860220)'
        },
        {
            id: '9860220',
            text: 'Chỉ huy, quản lý kỹ thuật (9860220)'
        },
        {
            id: '9860210',
            text: 'Chiến lược quân sự (9860210)'
        },
        {
            id: '9860211',
            text: 'Chiến lược quốc phòng (9860211)'
        },
        {
            id: '9860213',
            text: 'Chiến thuật (9860213)'
        },
        {
            id: '9340402',
            text: 'Chính sách công (9340402)'
        },
        {
            id: '9310201',
            text: 'Chính trị học (9310201)'
        },
        {
            id: '6510717',
            text: 'Chọn mẫu và hóa nghiệm dầu khí (6510717)'
        },
        {
            id: '6620123',
            text: 'Chọn và nhân giống cây trồng (6620123)'
        },
        {
            id: '9229002',
            text: 'Chủ nghĩa duy vật biện chứng và duy vật lịch sử (9229002)'
        },
        {
            id: '9229008',
            text: 'Chủ nghĩa xã hội khoa học (9229008)'
        },
        {
            id: '5520118',
            text: 'Cơ-Điệnmỏ (5520118)'
        },
        {
            id: '5520120',
            text: 'Cơ - Điện nông nghiệp (5520120)'
        },
        {
            id: '5520119',
            text: 'Cơ - Điện tuyển khoáng (5520119)'
        },
        {
            id: '6520261',
            text: 'Cơ điện lạnh thủy sản (6520261)'
        },
        {
            id: '6520262',
            text: 'Cơ điện nông thôn (6520262)'
        },
        {
            id: '6520263',
            text: 'Cơ điện tử (6520263)'
        },
        {
            id: '9440109',
            text: 'Cơ học (9440109)'
        },
        {
            id: '9440108',
            text: 'Cơ học chất lỏng và chất khí (9440108)'
        },
        {
            id: '9440107',
            text: 'Cơ học vật rắn (9440107)'
        },
        {
            id: '5520117',
            text: 'Cơ khí chế tạo (5520117)'
        },
        {
            id: '5520115',
            text: 'Cơ khí động lực (5520115)'
        },
        {
            id: '5520116',
            text: 'Cơ khí hóa chất (5520116)'
        },
        {
            id: '9520101',
            text: 'Cơ kỹ thuật (9520101)'
        },
        {
            id: '9460110',
            text: 'Cơ sở toán học cho tin học (9460110)'
        },
        {
            id: '9420106',
            text: 'Côn trùng học (9420106)'
        },
        {
            id: '6380202',
            text: 'Công chứng (6380202)'
        },
        {
            id: '6510419',
            text: 'Công nghệ cán, kéo kim loại (6510419)'
        },
        {
            id: '6540124',
            text: 'Công nghệ chế biến chè (6540124)'
        },
        {
            id: '7549001',
            text: 'Công nghệ chế biến lâm sản (7549001)'
        },
        {
            id: '9540105',
            text: 'Công nghệ chế biến thủy sản (9540105)'
        },
        {
            id: '5540303',
            text: 'Công nghệ chế biến tinh dầu và hương liệu mỹ phẩm (5540303)'
        },
        {
            id: '5510212',
            text: 'Công nghệ chế tạo dụng cụ (5510212)'
        },
        {
            id: '6510801',
            text: 'Công nghệ chế tạo khuôn in (6510801)'
        },
        {
            id: '7510202',
            text: 'Công nghệ chế tạo máy (7510202)'
        },
        {
            id: '6510213',
            text: 'Công nghệ chế tạo vỏ tàu thủy (6510213)'
        },
        {
            id: '6510215',
            text: 'Công nghệ chế tạo, bảo dưỡng đầu máy (6510215)'
        },
        {
            id: '6510214',
            text: 'Công nghệ chế tạo, bảo dưỡng toa xe (6510214)'
        },
        {
            id: '6510409',
            text: 'Công nghệ chống ăn mòn kim loại (6510409)'
        },
        {
            id: '7540206',
            text: 'Công nghệ da giày (7540206)'
        },
        {
            id: '5540209',
            text: 'Công nghệ da giày và sản xuất các sản phẩm từ da (5540209)'
        },
        {
            id: '7510701',
            text: 'Công nghệ dầu khí và khai thác dầu (7510701)'
        },
        {
            id: '6540202',
            text: 'Công nghệ dệt (6540202)'
        },
        {
            id: '9540204',
            text: 'Công nghệ dệt, may (9540204)'
        },
        {
            id: '5510408',
            text: 'Công nghệ điện hóa (5510408)'
        },
        {
            id: '6510418',
            text: 'Công nghệ đúc kim loại (6510418)'
        },
        {
            id: '9720202',
            text: 'Công nghệ dược phẩm và bào chế thuốc (9720202)'
        },
        {
            id: '5510420',
            text: 'Công nghệ gia công kim loại (5510420)'
        },
        {
            id: '6510506',
            text: 'Công nghệ gia công kính xây dựng (6510506)'
        },
        {
            id: '5540208',
            text: 'Công nghệ giặt - là (5540208)'
        },
        {
            id: '5510217',
            text: 'Công nghệ hàn (5510217)'
        },
        {
            id: '5510402',
            text: 'Công nghệ hóa hữu cơ (5510402)'
        },
        {
            id: '5510405',
            text: 'Công nghệ hóa nhựa (5510405)'
        },
        {
            id: '6510406',
            text: 'Công nghệ hóa nhuộm (6510406)'
        },
        {
            id: '5510407',
            text: 'Công nghệ hóa Silicat (5510407)'
        },
        {
            id: '5510403',
            text: 'Công nghệ hóa vô cơ (5510403)'
        },
        {
            id: '6510802',
            text: 'Công nghệ in (6510802)'
        },
        {
            id: '5540120',
            text: 'Công nghệ kỹ thuật chế biến cồn, rượu, bia và nước giải khát (5540120)'
        },
        {
            id: '5540301',
            text: 'Công nghệ kỹ thuật chế biến lâm sản (5540301)'
        },
        {
            id: '5540302',
            text: 'Công nghệ kỹ thuật chế biến mủ cao su (5540302)'
        },
        {
            id: '5620102',
            text: 'Công nghệ kỹ thuật chế biến sản phẩm cây nhiệt đới (5620102)'
        },
        {
            id: '5540101',
            text: 'Công nghệ kỹ thuật chế biến và bảo quản lương thực (5540101)'
        },
        {
            id: '5620101',
            text: 'Công nghệ kỹ thuật chế biến và bảo quản nông sản (5620101)'
        },
        {
            id: '5620104',
            text: 'Công nghệ kỹ thuật chế biến và bảo quản sản phẩm cây ăn quả (5620104)'
        },
        {
            id: '5620103',
            text: 'Công nghệ kỹ thuật chế biến và bảo quản sản phẩm cây công nghiệp (5620103)'
        },
        {
            id: '5540108',
            text: 'Công nghệ kỹ thuật chế biến và bảo quản thực phẩm (5540108)'
        },
        {
            id: '5510306',
            text: 'Công nghệ kỹ thuật chiếu sáng đô thị (5510306)'
        },
        {
            id: '7510203',
            text: 'Công nghệ kỹ thuật cơ điện tử (7510203)'
        },
        {
            id: '7510201',
            text: 'Công nghệ kỹ thuật cơ khí (7510201)'
        },
        {
            id: '5510102',
            text: 'Công nghệ kỹ thuật công trình giao thông (5510102)'
        },
        {
            id: '7510102',
            text: 'Công nghệ kỹ thuật công trình xây dựng (7510102)'
        },
        {
            id: '5510203',
            text: 'Công nghệ kỹ thuật đầu máy, toa xe (5510203)'
        },
        {
            id: '6510901',
            text: 'Công nghệ kỹ thuật địa chất (6510901)'
        },
        {
            id: '5510308',
            text: 'Công nghệ kỹ thuật điện đầu máy và toa xe (5510308)'
        },
        {
            id: '5510309',
            text: 'Công nghệ kỹ thuật điện máy bay (5510309)'
        },
        {
            id: '5510310',
            text: 'Công nghệ kỹ thuật điện máy mỏ (5510310)'
        },
        {
            id: '5510307',
            text: 'Công nghệ kỹ thuật điện tàu thủy (5510307)'
        },
        {
            id: '7510302',
            text: 'Công nghệ kỹ thuật điện tử - viễn thông (7510302)'
        },
        {
            id: '6510312',
            text: 'Công nghệ kỹ thuật điện tử, truyền thông (6510312)'
        },
        {
            id: '7510301',
            text: 'Công nghệ kỹ thuật điện, điện tử (7510301)'
        },
        {
            id: '5510305',
            text: 'Công nghệ kỹ thuật điều khiển tự động (5510305)'
        },
        {
            id: '7510303',
            text: 'Công nghệ kỹ thuật điều khiển và tự động hóa (7510303)'
        },
        {
            id: '5510210',
            text: 'Công nghệ kỹ thuật đo lường (5510210)'
        },
        {
            id: '6510204',
            text: 'Công nghệ kỹ thuật đóng mới thân tàu biển (6510204)'
        },
        {
            id: '7510104',
            text: 'Công nghệ kỹ thuật giao thông (7510104)'
        },
        {
            id: '7510407',
            text: 'Công nghệ kỹ thuật hạt nhân (7510407)'
        },
        {
            id: '5510701',
            text: 'Công nghệ kỹ thuật hóa dầu (5510701)'
        },
        {
            id: '7510401',
            text: 'Công nghệ kỹ thuật hóa học (7510401)'
        },
        {
            id: '5510209',
            text: 'Công nghệ kỹ thuật kết cấu thép (5510209)'
        },
        {
            id: '5540127',
            text: 'Công nghệ kỹ thuật kiểm nghiệm chất lượng lương thực, thực phẩm (5540127)'
        },
        {
            id: '7510101',
            text: 'Công nghệ kỹ thuật kiến trúc (7510101)'
        },
        {
            id: '5540116',
            text: 'Công nghệ kỹ thuật lên men (5540116)'
        },
        {
            id: '5510206',
            text: 'Công nghệ kỹ thuật máy nông - lâm nghiệp (5510206)'
        },
        {
            id: '7480108',
            text: 'Công nghệ kỹ thuật máy tính (7480108)'
        },
        {
            id: '5510207',
            text: 'Công nghệ kỹ thuật máy và thiết bị hóa chất (5510207)'
        },
        {
            id: '6511001',
            text: 'Công nghệ kỹ thuật mỏ (6511001)'
        },
        {
            id: '7510406',
            text: 'Công nghệ kỹ thuật môi trường (7510406)'
        },
        {
            id: '7510206',
            text: 'Công nghệ kỹ thuật nhiệt (7510206)'
        },
        {
            id: '5510106',
            text: 'Công nghệ kỹ thuật nội thất và điện nước công trình (5510106)'
        },
        {
            id: '7510205',
            text: 'Công nghệ kỹ thuật ô tô (7510205)'
        },
        {
            id: '5510202',
            text: 'Công nghệ kỹ thuật ô tô - máy kéo (5510202)'
        },
        {
            id: '5540111',
            text: 'Công nghệ kỹ thuật sản xuất đường, bánh kẹo (5540111)'
        },
        {
            id: '5540113',
            text: 'Công nghệ kỹ thuật sản xuất muối (5540113)'
        },
        {
            id: '6510422',
            text: 'Công nghệ kỹ thuật tài nguyên nước (6510422)'
        },
        {
            id: '7510207',
            text: 'Công nghệ kỹ thuật tàu thủy (7510207)'
        },
        {
            id: '5510311',
            text: 'Công nghệ kỹ thuật thiết bị y tế (5510311)'
        },
        {
            id: '5540210',
            text: 'Công nghệ kỹ thuật thuộc da (5540210)'
        },
        {
            id: '5510208',
            text: 'Công nghệ kỹ thuật thủy lực (5510208)'
        },
        {
            id: '6510902',
            text: 'Công nghệ kỹ thuật trắc địa (6510902)'
        },
        {
            id: '5510416',
            text: 'Công nghệ kỹ thuật vật liệu (5510416)'
        },
        {
            id: '7510105',
            text: 'Công nghệ kỹ thuật vật liệu xây dựng (7510105)'
        },
        {
            id: '5510205',
            text: 'Công nghệ kỹ thuật vỏ tàu thủy (5510205)'
        },
        {
            id: '7510103',
            text: 'Công nghệ kỹ thuật xây dựng (7510103)'
        },
        {
            id: '6510410',
            text: 'Công nghệ mạ (6510410)'
        },
        {
            id: '6540203',
            text: 'Công nghệ may (6540203)'
        },
        {
            id: '5540203',
            text: 'Công nghệ may và thời trang (5540203)'
        },
        {
            id: '6540206',
            text: 'Công nghệ may Veston (6540206)'
        },
        {
            id: '6510417',
            text: 'Công nghệ nhiệt luyện (6510417)'
        },
        {
            id: '6510216',
            text: 'Công nghệ ô tô (6510216)'
        },
        {
            id: '5320104',
            text: 'Công nghệ phát thanh - truyền hình (5320104)'
        },
        {
            id: '5510602',
            text: 'Công nghệ quản lý chất lượng (5510602)'
        },
        {
            id: '7620113',
            text: 'Công nghệ rau hoa quả và cảnh quan (7620113)'
        },
        {
            id: '6510502',
            text: 'Công nghệ sản xuất alumin (6510502)'
        },
        {
            id: '6510501',
            text: 'Công nghệ sản xuất bột giấy và giấy (6510501)'
        },
        {
            id: '6510504',
            text: 'Công nghệ sản xuất chất dẻo từ Polyme (6510504)'
        },
        {
            id: '6510503',
            text: 'Công nghệ sản xuất sản phẩm từ cao su (6510503)'
        },
        {
            id: '6510505',
            text: 'Công nghệ sản xuất ván nhân tạo (6510505)'
        },
        {
            id: '9540104',
            text: 'Công nghệ sau thu hoạch (9540104)'
        },
        {
            id: '9420201',
            text: 'Công nghệ sinh học (9420201)'
        },
        {
            id: '6540201',
            text: 'Công nghệ sợi (6540201)'
        },
        {
            id: '7540202',
            text: 'Công nghệ sợi, dệt (7540202)'
        },
        {
            id: '5510411',
            text: 'Công nghệ sơn (5510411)'
        },
        {
            id: '5510413',
            text: 'Công nghệ sơn điện di (5510413)'
        },
        {
            id: '5510414',
            text: 'Công nghệ sơn ô tô (5510414)'
        },
        {
            id: '6510415',
            text: 'Công nghệ sơn tàu thủy (6510415)'
        },
        {
            id: '6510412',
            text: 'Công nghệ sơn tĩnh điện (6510412)'
        },
        {
            id: '9480201',
            text: 'Công nghệ thông tin (9480201)'
        },
        {
            id: '6480202',
            text: 'Công nghệ thông tin (ứng dụng phần mềm) (6480202)'
        },
        {
            id: '9540101',
            text: 'Công nghệ thực phẩm (9540101)'
        },
        {
            id: '7320106',
            text: 'Công nghệ truyền thông (7320106)'
        },
        {
            id: '6511002',
            text: 'Công nghệ tuyển khoáng (6511002)'
        },
        {
            id: '7510402',
            text: 'Công nghệ vật liệu (7510402)'
        },
        {
            id: '9540203',
            text: 'Công nghệ vật liệu dệt, may (9540203)'
        },
        {
            id: '5760103',
            text: 'Công tác công đoàn (5760103)'
        },
        {
            id: '7760102',
            text: 'Công tác thanh thiếu niên (7760102)'
        },
        {
            id: '9760101',
            text: 'Công tác xã hội (9760101)'
        },
        {
            id: '5510107',
            text: 'Công trình thủy lợi (5510107)'
        },
        {
            id: '5580207',
            text: 'Cốp pha - giàn giáo (5580207)'
        },
        {
            id: '5580208',
            text: 'Cốt thép - hàn (5580208)'
        },
        {
            id: '5860202',
            text: 'Đặc công (5860202)'
        },
        {
            id: '5810109',
            text: 'Đại lý lữ hành (5810109)'
        },
        {
            id: '9460104',
            text: 'Đại số và lí thuyết số (9460104)'
        },
        {
            id: '8540106',
            text: 'Đảm bảo chất lượng và an toàn thực phẩm (8540106)'
        },
        {
            id: '5720304',
            text: 'Dân số y tế (5720304)'
        },
        {
            id: '9310310',
            text: 'Dân tộc học (9310310)'
        },
        {
            id: '7210235',
            text: 'Đạo diễn điện ảnh, truyền hình (7210235)'
        },
        {
            id: '7210227',
            text: 'Đạo diễn sân khấu (7210227)'
        },
        {
            id: '9229006',
            text: 'Đạo đức học (9229006)'
        },
        {
            id: '5840118',
            text: 'Đặt chỗ bán vé (5840118)'
        },
        {
            id: '5810108',
            text: 'Đặt giữ chỗ du lịch (5810108)'
        },
        {
            id: '9420121',
            text: 'Di truyền học (9420121)'
        },
        {
            id: '9620207',
            text: 'Di truyền và chọn giống cây lâm nghiệp (9620207)'
        },
        {
            id: '9620111',
            text: 'Di truyền và chọn giống cây trồng (9620111)'
        },
        {
            id: '9620108',
            text: 'Di truyền và chọn giống vật nuôi (9620108)'
        },
        {
            id: '5510903',
            text: 'Địa chất công trình (5510903)'
        },
        {
            id: '5510906',
            text: 'Địa chất dầu khí (5510906)'
        },
        {
            id: '9440201',
            text: 'Địa chất học (9440201)'
        },
        {
            id: '5510905',
            text: 'Địa chất thăm dò khoáng sản (5510905)'
        },
        {
            id: '5510904',
            text: 'Địa chất thủy văn (5510904)'
        },
        {
            id: '9580211',
            text: 'Địa kỹ thuật xây dựng (9580211)'
        },
        {
            id: '9440217',
            text: 'Địa lí tự nhiên (9440217)'
        },
        {
            id: '9310501',
            text: 'Địa lý học (9310501)'
        },
        {
            id: '9440220',
            text: 'Địa lý tài nguyên và môi trường (9440220)'
        },
        {
            id: '7440217',
            text: 'Địa lý tự nhiên (7440217)'
        },
        {
            id: '9440218',
            text: 'Địa mạo và cổ địa lý (9440218)'
        },
        {
            id: '9440210',
            text: 'Địa vật lí (9440210)'
        },
        {
            id: '9720117',
            text: 'Dịch tễ học (9720117)'
        },
        {
            id: '9640108',
            text: 'Dịch tễ học thú y (9640108)'
        },
        {
            id: '6760203',
            text: 'Dịch vụ chăm sóc gia đình (6760203)'
        },
        {
            id: '6380201',
            text: 'Dịch vụ pháp lý (6380201)'
        },
        {
            id: '5810401',
            text: 'Dịch vụ thẩm mỹ (5810401)'
        },
        {
            id: '6640201',
            text: 'Dịch vụ thú y (6640201)'
        },
        {
            id: '6340134',
            text: 'Dịch vụ thương mại hàng không (6340134)'
        },
        {
            id: '5840119',
            text: 'Dịch vụ trên tàu bay (5840119)'
        },
        {
            id: '5840114',
            text: 'Dịch vụ trên tàu biển (5840114)'
        },
        {
            id: '5760201',
            text: 'Dịch vụ xã hội (5760201)'
        },
        {
            id: '5580212',
            text: 'Điện - nước (5580212)'
        },
        {
            id: '6520227',
            text: 'Điện công nghiệp (6520227)'
        },
        {
            id: '5520223',
            text: 'Điện công nghiệp và dân dụng (5520223)'
        },
        {
            id: '6520226',
            text: 'Điện dân dụng (6520226)'
        },
        {
            id: '6520229',
            text: 'Điện đầu máy đường sắt (6520229)'
        },
        {
            id: '9720111',
            text: 'Điện quang và y học hạt nhân (9720111)'
        },
        {
            id: '6520228',
            text: 'Điện tàu thủy (6520228)'
        },
        {
            id: '5520230',
            text: 'Điện toa xe đường sắt (5520230)'
        },
        {
            id: '6520225',
            text: 'Điện tử công nghiệp (6520225)'
        },
        {
            id: '5520222',
            text: 'Điện tử công nghiệp và dân dụng (5520222)'
        },
        {
            id: '6520224',
            text: 'Điện tử dân dụng (6520224)'
        },
        {
            id: '6210211',
            text: 'Diễn viên kịch - điện ảnh (6210211)'
        },
        {
            id: '7210234',
            text: 'Diễn viên kịch, điện ảnh - truyền hình (7210234)'
        },
        {
            id: '7210242',
            text: 'Diễn viên múa (7210242)'
        },
        {
            id: '7210226',
            text: 'Diễn viên sân khấu kịch hát (7210226)'
        },
        {
            id: '5860205',
            text: 'Điệp báo chiến dịch (5860205)'
        },
        {
            id: '6520258',
            text: 'Điều độ lưới điện phân phối (6520258)'
        },
        {
            id: '9720301',
            text: 'Điều dưỡng (9720301)'
        },
        {
            id: '6720202',
            text: 'Điều dưỡng y học cổ truyền (6720202)'
        },
        {
            id: '6840121',
            text: 'Điều hành bay (6840121)'
        },
        {
            id: '6840126',
            text: 'Điều hành chạy tàu hỏa (6840126)'
        },
        {
            id: '6840129',
            text: 'Điều hành đường sắt đô thị (6840129)'
        },
        {
            id: '6810107',
            text: 'Điều hành tour du lịch (6810107)'
        },
        {
            id: '7210105',
            text: 'Điêu khắc (7210105)'
        },
        {
            id: '6840109',
            text: 'Điều khiển phương tiện thủy nội địa (6840109)'
        },
        {
            id: '6840110',
            text: 'Điều khiển tàu biển (6840110)'
        },
        {
            id: '6520191',
            text: 'Điều khiển tàu cuốc (6520191)'
        },
        {
            id: '5840124',
            text: 'Điều khiển tàu hỏa (5840124)'
        },
        {
            id: '9860104',
            text: 'Điều tra hình sự (9860104)'
        },
        {
            id: '9620208',
            text: 'Điều tra và quy hoạch rừng (9620208)'
        },
        {
            id: '9720401',
            text: 'Dinh dưỡng (9720401)'
        },
        {
            id: '9620107',
            text: 'Dinh dưỡng và thức ăn chăn nuôi (9620107)'
        },
        {
            id: '6510908',
            text: 'Đo đạc bản đồ (6510908)'
        },
        {
            id: '6510909',
            text: 'Đo đạc địa chính (6510909)'
        },
        {
            id: '6210414',
            text: 'Đồ gốm mỹ thuật (6210414)'
        },
        {
            id: '7210104',
            text: 'Đồ hoạ (7210104)'
        },
        {
            id: '6510611',
            text: 'Đo lường dao động và cân bằng động (6510611)'
        },
        {
            id: '6520259',
            text: 'Đo lường điện (6520259)'
        },
        {
            id: '9140115',
            text: 'Đo lường và đánh giá trong giáo dục (9140115)'
        },
        {
            id: '6510613',
            text: 'Đo lường và phân tích các thành phần kim loại (6510613)'
        },
        {
            id: '8580112',
            text: 'Đô thị học (8580112)'
        },
        {
            id: '9440305',
            text: 'Độc học môi trường (9440305)'
        },
        {
            id: '5210218',
            text: 'Đờn ca nhạc tài tử Nam Bộ (5210218)'
        },
        {
            id: '9310620',
            text: 'Đông Nam Á học (9310620)'
        },
        {
            id: '9310608',
            text: 'Đông phương học (9310608)'
        },
        {
            id: '9420103',
            text: 'Động vật học (9420103)'
        },
        {
            id: '9810101',
            text: 'Du lịch (9810101)'
        },
        {
            id: '5810101',
            text: 'Du lịch lữ hành (5810101)'
        },
        {
            id: '5810102',
            text: 'Du lịch sinh thái (5810102)'
        },
        {
            id: '6210408',
            text: 'Đúc, dát đồng mỹ nghệ (6210408)'
        },
        {
            id: '7720201',
            text: 'Dược học (7720201)'
        },
        {
            id: '9720206',
            text: 'Dược liệu - Dược học cổ truyền (9720206)'
        },
        {
            id: '9720118',
            text: 'Dược lý và độc chất (9720118)'
        },
        {
            id: '9720205',
            text: 'Dược lý và dược lâm sàng (9720205)'
        },
        {
            id: '6720401',
            text: 'Dược sỹ cao đẳng (6720401)'
        },
        {
            id: '5720401',
            text: 'Dược sỹ trung cấp (5720401)'
        },
        {
            id: '5640202',
            text: 'Dược thú y (5640202)'
        },
        {
            id: '9720102',
            text: 'Gây mê hồi sức (9720102)'
        },
        {
            id: '6210410',
            text: 'Gia công đá quý (6210410)'
        },
        {
            id: '6520108',
            text: 'Gia công khuôn dưỡng và phóng dạng tàu thủy (6520108)'
        },
        {
            id: '6520109',
            text: 'Gia công lắp ráp hệ thống ống tàu thủy (6520109)'
        },
        {
            id: '6520106',
            text: 'Gia công ống công nghệ (6520106)'
        },
        {
            id: '6520107',
            text: 'Gia công và lắp dựng kết cấu thép (6520107)'
        },
        {
            id: '6520110',
            text: 'Gia công và lắp ráp nội thất tàu thủy (6520110)'
        },
        {
            id: '6210423',
            text: 'Gia công và thiết kế sản phẩm mộc (6210423)'
        },
        {
            id: '7229045',
            text: 'Gia đình học (7229045)'
        },
        {
            id: '6510610',
            text: 'Giám định khối lượng, chất lượng than (6510610)'
        },
        {
            id: '7140205',
            text: 'Giáo dục Chính trị (7140205)'
        },
        {
            id: '7140204',
            text: 'Giáo dục Công dân (7140204)'
        },
        {
            id: '9140118',
            text: 'Giáo dục đặc biệt (9140118)'
        },
        {
            id: '6310301',
            text: 'Giáo dục đồng đẳng (6310301)'
        },
        {
            id: '9140101',
            text: 'Giáo dục học (9140101)'
        },
        {
            id: '7140201',
            text: 'Giáo dục Mầm non (7140201)'
        },
        {
            id: '7140248',
            text: 'Giáo dục pháp luật (7140248)'
        },
        {
            id: '7140208',
            text: 'Giáo dục Quốc phòng - An ninh (7140208)'
        },
        {
            id: '9140117',
            text: 'Giáo dục quốc tế và so sánh (9140117)'
        },
        {
            id: '7140206',
            text: 'Giáo dục Thể chất (7140206)'
        },
        {
            id: '7140202',
            text: 'Giáo dục Tiểu học (7140202)'
        },
        {
            id: '8729002',
            text: 'Giáo dục y học (8729002)'
        },
        {
            id: '6520122',
            text: 'Gò (6520122)'
        },
        {
            id: '7210107',
            text: 'Góm (7210107)'
        },
        {
            id: '9440228',
            text: 'Hải dương học (9440228)'
        },
        {
            id: '6520123',
            text: 'Hàn (6520123)'
        },
        {
            id: '9220104',
            text: 'Hán Nôm (9220104)'
        },
        {
            id: '9860116',
            text: 'Hậu cần công an nhân dân (9860116)'
        },
        {
            id: '9860218',
            text: 'Hậu cần quân sự (9860218)'
        },
        {
            id: '5520265',
            text: 'Hệ thống điện (5520265)'
        },
        {
            id: '6520267',
            text: 'Hệ thống điện đường sắt đô thị (6520267)'
        },
        {
            id: '8620118',
            text: 'Hệ thống nông nghiệp (8620118)'
        },
        {
            id: '9480104',
            text: 'Hệ thống thông tin (9480104)'
        },
        {
            id: '5510917',
            text: 'Hệ thống thông tin địa lý (GIS) (5510917)'
        },
        {
            id: '6460203',
            text: 'Hệ thống thông tin kinh tế (6460203)'
        },
        {
            id: '9340405',
            text: 'Hệ thống thông tin quản lý (9340405)'
        },
        {
            id: '9460105',
            text: 'Hình học và tôpô (9460105)'
        },
        {
            id: '9310204',
            text: 'Hồ Chí Minh học (9310204)'
        },
        {
            id: '9720302',
            text: 'Hộ sinh (9720302)'
        },
        {
            id: '8760103',
            text: 'Hỗ trợ giáo dục người khuyết tật (8760103)'
        },
        {
            id: '9720203',
            text: 'Hóa dược (9720203)'
        },
        {
            id: '9440112',
            text: 'Hóa học (9440112)'
        },
        {
            id: '9440117',
            text: 'Hóa học các hợp chất thiên nhiên (9440117)'
        },
        {
            id: '9440114',
            text: 'Hóa hữu cơ (9440114)'
        },
        {
            id: '9440119',
            text: 'Hóa lí thuyết và hóa lí (9440119)'
        },
        {
            id: '9440120',
            text: 'Hóa môi trường (9440120)'
        },
        {
            id: '9440118',
            text: 'Hóa phân tích (9440118)'
        },
        {
            id: '9720208',
            text: 'Hóa sinh dược (9720208)'
        },
        {
            id: '9420116',
            text: 'Hóa sinh học (9420116)'
        },
        {
            id: '5580102',
            text: 'Họa viên kiến trúc (5580102)'
        },
        {
            id: '9440113',
            text: 'Hóa vô cơ (9440113)'
        },
        {
            id: '7210103',
            text: 'Hội hoạ (7210103)'
        },
        {
            id: '9720103',
            text: 'Hồi sức cấp cứu và chống độc (9720103)'
        },
        {
            id: '5860211',
            text: 'Huấn luyện động vật nghiệp vụ (5860211)'
        },
        {
            id: '7210244',
            text: 'Huấn luyện múa (7210244)'
        },
        {
            id: '7140207',
            text: 'Huấn luyện thể thao (7140207)'
        },
        {
            id: '6810103',
            text: 'Hướng dẫn du lịch (6810103)'
        },
        {
            id: '5340142',
            text: 'Kế hoạch đầu tư (5340142)'
        },
        {
            id: '9340301',
            text: 'Kế toán (9340301)'
        },
        {
            id: '6340302',
            text: 'Kế toán doanh nghiệp (6340302)'
        },
        {
            id: '5340307',
            text: 'Kế toán hành chính sự nghiệp (5340307)'
        },
        {
            id: '5340308 Kế toán hợp tác xã',
            text: ' (5340308 Kế toán hợp tác xã)'
        },
        {
            id: '6340303 Kế toán lao động, tiền lương và bảo hiểm xã hội',
            text: ' (6340303 Kế toán lao động, tiền lương và bảo hiểm xã hội)'
        },
        {
            id: '6340305',
            text: 'Kế toán ngân hàng (6340305)'
        },
        {
            id: '5340306',
            text: 'Kế toán tin học (5340306)'
        },
        {
            id: '6340304',
            text: 'Kế toán vật tư (6340304)'
        },
        {
            id: '5340309',
            text: 'Kế toán xây dựng (5340309)'
        },
        {
            id: '91490',
            text: 'Khác (91490)'
        },
        {
            id: '5840103',
            text: 'Khai thác cảng hàng không (5840103)'
        },
        {
            id: '5620307',
            text: 'Khai thác hàng hải thủy sản (5620307)'
        },
        {
            id: '6840111',
            text: 'Khai thác máy tàu biển (6840111)'
        },
        {
            id: '6840112',
            text: 'Khai thác máy tàu thủy (6840112)'
        },
        {
            id: '9520603',
            text: 'Khai thác mỏ (9520603)'
        },
        {
            id: '6520268',
            text: 'Khai thác thiết bị dẫn đường vô tuyến mặt đất hàng không (6520268)'
        },
        {
            id: '9620304',
            text: 'Khai thác thủy sản (9620304)'
        },
        {
            id: '5620306',
            text: 'Khai thác và bảo vệ nguồn lợi thủy sản (5620306)'
        },
        {
            id: '6840102',
            text: 'Khai thác vận tải (6840102)'
        },
        {
            id: '5840104',
            text: 'Khai thác vận tải đường biển (5840104)'
        },
        {
            id: '5840106',
            text: 'Khai thác vận tải đường bộ (5840106)'
        },
        {
            id: '5840107',
            text: 'Khai thác vận tải đường không (5840107)'
        },
        {
            id: '5840108',
            text: 'Khai thác vận tải đường sắt (5840108)'
        },
        {
            id: '5840105',
            text: 'Khai thác vận tải thủy nội địa (5840105)'
        },
        {
            id: '6620305',
            text: 'Khai thác, đánh bắt hải sản (6620305)'
        },
        {
            id: '9229017',
            text: 'Khảo cổ học (9229017)'
        },
        {
            id: '6510913',
            text: 'Khảo sát địa chất (6510913)'
        },
        {
            id: '6510912',
            text: 'Khảo sát địa hình (6510912)'
        },
        {
            id: '6510914',
            text: 'Khảo sát thủy văn (6510914)'
        },
        {
            id: '5860219',
            text: 'Khí tài quang học (5860219)'
        },
        {
            id: '5440206',
            text: 'Khí tượng (5440206)'
        },
        {
            id: '6440206',
            text: 'Khí tượng học (6440206)'
        },
        {
            id: '9440222',
            text: 'Khí tượng và khí hậu học (9440222)'
        },
        {
            id: '9620110',
            text: 'Khoa học cây trồng (9620110)'
        },
        {
            id: '9620103',
            text: 'Khoa học đất (9620103)'
        },
        {
            id: '9840106',
            text: 'Khoa học hàng hải (9840106)'
        },
        {
            id: '9480101',
            text: 'Khoa học máy tính (9480101)'
        },
        {
            id: '9440301',
            text: 'Khoa học môi trường (9440301)'
        },
        {
            id: '8340401',
            text: 'Khoa học quản lý (8340401)'
        },
        {
            id: '8720159',
            text: 'Khoa học thần kinh (8720159)'
        },
        {
            id: '9320203',
            text: 'Khoa học thư viện (9320203)'
        },
        {
            id: '7620303',
            text: 'Khoa học thủy sản (7620303)'
        },
        {
            id: '8460107',
            text: 'Khoa học tính toán (8460107)'
        },
        {
            id: '9440122',
            text: 'Khoa học vật liệu (9440122)'
        },
        {
            id: '9720101',
            text: 'Khoa học y sinh (9720101)'
        },
        {
            id: '6511009',
            text: 'Khoan đào đường hầm (6511009)'
        },
        {
            id: '6510702',
            text: 'Khoan khai thác dầu khí (6510702)'
        },
        {
            id: '6511010',
            text: 'Khoan khai thác mỏ (6511010)'
        },
        {
            id: '6511008',
            text: 'Khoan nổ mìn (6511008)'
        },
        {
            id: '6510703',
            text: 'Khoan thăm dò dầu khí (6510703)'
        },
        {
            id: '6510915',
            text: 'Khoan thăm dò địa chất (6510915)'
        },
        {
            id: '9440205',
            text: 'Khoáng vật học và địa hóa học (9440205)'
        },
        {
            id: '5620310',
            text: 'Khuyến ngư (5620310)'
        },
        {
            id: '7620102',
            text: 'Khuyến nông (7620102)'
        },
        {
            id: '6620121',
            text: 'Khuyến nông lâm (6620121)'
        },
        {
            id: '6620208',
            text: 'Kiểm lâm (6620208)'
        },
        {
            id: '6510605',
            text: 'Kiểm nghiệm bột giấy và giấy (6510605)'
        },
        {
            id: '6510614',
            text: 'Kiểm nghiệm chất lượng cao su (6510614)'
        },
        {
            id: '6510603',
            text: 'Kiểm nghiệm chất lượng lương thực, thực phẩm (6510603)'
        },
        {
            id: '6510604',
            text: 'Kiểm nghiệm đường mía (6510604)'
        },
        {
            id: '9720210',
            text: 'Kiểm nghiệm thuốc và độc chất (9720210)'
        },
        {
            id: '6510615',
            text: 'Kiểm nghiệm, phân tích gốm, sứ, thủy tinh (6510615)'
        },
        {
            id: '6620311',
            text: 'Kiểm ngư (6620311)'
        },
        {
            id: '6840122',
            text: 'Kiểm soát không lưu (6840122)'
        },
        {
            id: '7340302',
            text: 'Kiểm toán (7340302)'
        },
        {
            id: '6510612',
            text: 'Kiểm tra phân tích kết cấu thép và kim loại (6510612)'
        },
        {
            id: '6510609',
            text: 'Kiểm tra và phân tích hóa chất (6510609)'
        },
        {
            id: '9580101',
            text: 'Kiến trúc (9580101)'
        },
        {
            id: '7580102',
            text: 'Kiến trúc cảnh quan (7580102)'
        },
        {
            id: '7580104',
            text: 'Kiến trúc đô thị (7580104)'
        },
        {
            id: '8580103',
            text: 'Kiến trúc nội thất (8580103)'
        },
        {
            id: '6210411',
            text: 'Kim hoàn (6210411)'
        },
        {
            id: '9440129',
            text: 'Kim loại học (9440129)'
        },
        {
            id: '5340108',
            text: 'Kinh doanh bất động sản (5340108)'
        },
        {
            id: '5340104',
            text: 'Kinh doanh bưu chính viễn thông (5340104)'
        },
        {
            id: '6840203',
            text: 'Kinh doanh dịch vụ Bưu chính Viễn thông (6840203)'
        },
        {
            id: '5340103',
            text: 'Kinh doanh ngân hàng (5340103)'
        },
        {
            id: '7620114',
            text: 'Kinh doanh nông nghiệp (7620114)'
        },
        {
            id: '7340120',
            text: 'Kinh doanh quốc tế (7340120)'
        },
        {
            id: '6840202',
            text: 'Kinh doanh thiết bị viễn thông tin học (6840202)'
        },
        {
            id: '7340123',
            text: 'Kinh doanh thời trang và dệt may (7340123)'
        },
        {
            id: '9340121',
            text: 'Kinh doanh thương mại (9340121)'
        },
        {
            id: '5340101',
            text: 'Kinh doanh thương mại và dịch vụ (5340101)'
        },
        {
            id: '5340110',
            text: 'Kinh doanh vận tải đường bộ (5340110)'
        },
        {
            id: '5340111',
            text: 'Kinh doanh vận tải đường sắt (5340111)'
        },
        {
            id: '5340109',
            text: 'Kinh doanh vận tải đường thủy (5340109)'
        },
        {
            id: '5340112',
            text: 'Kinh doanh vận tải hàng không (5340112)'
        },
        {
            id: '5340107',
            text: 'Kinh doanh vật liệu xây dựng (5340107)'
        },
        {
            id: '5340105',
            text: 'Kinh doanh xăng dầu và khí đốt (5340105)'
        },
        {
            id: '7320402',
            text: 'Kinh doanh xuất bản phẩm (7320402)'
        },
        {
            id: '6340113',
            text: 'Kinh doanh xuất bản phẩm văn hóa (6340113)'
        },
        {
            id: '5340102',
            text: 'Kinh doanh xuất nhập khẩu (5340102)'
        },
        {
            id: '9310102',
            text: 'Kinh tế chính trị (9310102)'
        },
        {
            id: '7510604',
            text: 'Kinh tế công nghiệp (7510604)'
        },
        {
            id: '9310104',
            text: 'Kinh tế đầu tư (9310104)'
        },
        {
            id: '7810501',
            text: 'Kinh tế gia đình (7810501)'
        },
        {
            id: '9310101',
            text: 'Kinh tế học (9310101)'
        },
        {
            id: '9620115',
            text: 'Kinh tế nông nghiệp (9620115)'
        },
        {
            id: '9310105',
            text: 'Kinh tế phát triển (9310105)'
        },
        {
            id: '9310106',
            text: 'Kinh tế quốc tế (9310106)'
        },
        {
            id: '7850102',
            text: 'Kinh tế tài nguyên thiên nhiên (7850102)'
        },
        {
            id: '7840104',
            text: 'Kinh tế vận tải (7840104)'
        },
        {
            id: '8580301',
            text: 'Kinh tế xây dựng (8580301)'
        },
        {
            id: '9420105',
            text: 'Ký sinh trùng học (9420105)'
        },
        {
            id: '9640104',
            text: 'Ký sinh trùng và vi sinh vật học thú y (9640104)'
        },
        {
            id: '6520101',
            text: 'Kỹ thuật bảo dưỡng cơ khí tàu bay (6520101)'
        },
        {
            id: '7520206',
            text: 'Kỹ thuật biển (7520206)'
        },
        {
            id: '9580213',
            text: 'Kỹ thuật cấp thoát nước (9580213)'
        },
        {
            id: '6620204',
            text: 'Kỹ thuật cây cao su (6620204)'
        },
        {
            id: '5810403',
            text: 'Kỹ thuật chăm sóc tóc (5810403)'
        },
        {
            id: '9549001',
            text: 'Kỹ thuật chế biến lâm sản (9549001)'
        },
        {
            id: '6810207',
            text: 'Kỹ thuật chế biến món ăn (6810207)'
        },
        {
            id: '6520203',
            text: 'Kỹ thuật cơ điện chế biến cao su (6520203)'
        },
        {
            id: '6520204',
            text: 'Kỹ thuật cơ điện mỏ hầm lò (6520204)'
        },
        {
            id: '5520202',
            text: 'Kỹ thuật cơ điện sản xuất gốm, sứ, thủy tinh (5520202)'
        },
        {
            id: '5860215',
            text: 'Kỹ thuật cơ điện tăng thiết giáp (5860215)'
        },
        {
            id: '8520114',
            text: 'Kỹ thuật cơ điện tử (8520114)'
        },
        {
            id: '9520103',
            text: 'Kỹ thuật cơ khí (9520103)'
        },
        {
            id: '9520116',
            text: 'Kỹ thuật cơ khí động lực (9520116)'
        },
        {
            id: '9580210',
            text: 'Kỹ thuật cơ sở hạ tầng (9580210)'
        },
        {
            id: '8520117',
            text: 'Kỹ thuật công nghiệp (8520117)'
        },
        {
            id: '6520218',
            text: 'Kỹ thuật đài trạm viễn thông (6520218)'
        },
        {
            id: '6520213',
            text: 'Kỹ thuật dẫn đường hàng không (6520213)'
        },
        {
            id: '9520604',
            text: 'Kỹ thuật dầu khí (9520604)'
        },
        {
            id: '6620122',
            text: 'Kỹ thuật dâu tằm tơ (6620122)'
        },
        {
            id: '7520312',
            text: 'Kỹ thuật dệt (7520312)'
        },
        {
            id: '9520501',
            text: 'Kỹ thuật địa chất (9520501)'
        },
        {
            id: '9520502',
            text: 'Kỹ thuật địa vật lý (9520502)'
        },
        {
            id: '9520201',
            text: 'Kỹ thuật điện (9520201)'
        },
        {
            id: '6520206',
            text: 'Kỹ thuật điện cảng hàng không (6520206)'
        },
        {
            id: '6520208',
            text: 'Kỹ thuật điện tàu bay (6520208)'
        },
        {
            id: '9520203',
            text: 'Kỹ thuật điện tử (9520203)'
        },
        {
            id: '7520207',
            text: 'Kỹ thuật điện tử - viễn thông (7520207)'
        },
        {
            id: '6520207',
            text: 'Kỹ thuật điện tử cảng hàng không (6520207)'
        },
        {
            id: '6520209',
            text: 'Kỹ thuật điện tử tàu bay (6520209)'
        },
        {
            id: '6520211',
            text: 'Kỹ thuật điện tử tàu thủy (6520211)'
        },
        {
            id: '6520210',
            text: 'Kỹ thuật điện, điện tử tàu biển (6520210)'
        },
        {
            id: '6210101',
            text: 'Kỹ thuật điêu khắc gỗ (6210101)'
        },
        {
            id: '9520216',
            text: 'Kỹ thuật điều khiển và tự động hóa (9520216)'
        },
        {
            id: '6720402',
            text: 'Kỹ thuật dược (6720402)'
        },
        {
            id: '8520120',
            text: 'Kỹ thuật hàng không (8520120)'
        },
        {
            id: '9520402',
            text: 'Kỹ thuật hạt nhân (9520402)'
        },
        {
            id: '9520118',
            text: 'Kỹ thuật hệ thống công nghiệp (9520118)'
        },
        {
            id: '6720305',
            text: 'Kỹ thuật hình ảnh y học (6720305)'
        },
        {
            id: '9860108',
            text: 'Kỹ thuật hình sự (9860108)'
        },
        {
            id: '9520305',
            text: 'Kỹ thuật hóa dầu và lọc dầu (9520305)'
        },
        {
            id: '9520301',
            text: 'Kỹ thuật hóa học (9520301)'
        },
        {
            id: '9520137',
            text: 'Kỹ thuật in (9520137)'
        },
        {
            id: '6511004',
            text: 'Kỹ thuật khai thác mỏ hầm lò (6511004)'
        },
        {
            id: '5511005',
            text: 'Kỹ thuật khai thác mỏ lộ thiên (5511005)'
        },
        {
            id: '9520121',
            text: 'Kỹ thuật không gian (9520121)'
        },
        {
            id: '6720403',
            text: 'Kỹ thuật kiểm nghiệm thuốc (6720403)'
        },
        {
            id: '6810210',
            text: 'Kỹ thuật làm bánh (6810210)'
        },
        {
            id: '6520219',
            text: 'Kỹ thuật lắp đặt đài trạm viễn thông (6520219)'
        },
        {
            id: '6520201',
            text: 'Kỹ thuật lắp đặt điện và điều khiển trong công nghiệp (6520201)'
        },
        {
            id: '6520103',
            text: 'Kỹ thuật lắp đặt ống công nghệ (6520103)'
        },
        {
            id: '6529001',
            text: 'Kỹ thuật lò hơi (6529001)'
        },
        {
            id: '6520217',
            text: 'Kỹ thuật mạng ngoại vi và thiết bị dầu cuối (6520217)'
        },
        {
            id: '5520217',
            text: 'Kỹ thuật mạng ngoại vi và thiết bị đầu cuối (5520217)'
        },
        {
            id: '9520209',
            text: 'Kỹ thuật mật mã (9520209)'
        },
        {
            id: '5860212',
            text: 'Kỹ thuật mật mã quân sự (5860212)'
        },
        {
            id: '5520205',
            text: 'Kỹ thuật máy lạnh và điều hoà không khí (5520205)'
        },
        {
            id: '6520205',
            text: 'Kỹ thuật máy lạnh và điều hoà khôngkhí (6520205)'
        },
        {
            id: '6520102',
            text: 'Kỹ thuật máy nông nghiệp (6520102)'
        },
        {
            id: '9480106',
            text: 'Kỹ thuật máy tính (9480106)'
        },
        {
            id: '9520320',
            text: 'Kỹ thuật môi trường (9520320)'
        },
        {
            id: '8520135',
            text: 'Kỹ thuật năng lượng (8520135)'
        },
        {
            id: '5520216',
            text: 'Kỹ thuật nguồn điện thông tin (5520216)'
        },
        {
            id: '9520115',
            text: 'Kỹ thuật nhiệt (9520115)'
        },
        {
            id: '9520130',
            text: 'Kỹ thuật ô tô (9520130)'
        },
        {
            id: '6810209',
            text: 'Kỹ thuật pha chế đồ uống (6810209)'
        },
        {
            id: '5810208',
            text: 'Kỹ thuật pha chế và phục vụ đồ uống (5810208)'
        },
        {
            id: '9480103',
            text: 'Kỹ thuật phần mềm (9480103)'
        },
        {
            id: '5510705',
            text: 'Kỹ thuật phân tích các sản phẩm hóa dầu và lọc dầu (5510705)'
        },
        {
            id: '6510118',
            text: 'Kỹ thuật phục chế, gia công nhà gỗ cổ (6510118)'
        },
        {
            id: '7720502',
            text: 'Kỹ thuật phục hình răng (7720502)'
        },
        {
            id: '9720603',
            text: 'Kỹ thuật phục hồi chức năng (9720603)'
        },
        {
            id: '7520204',
            text: 'Kỹ thuật ra đa - dẫn đường (7520204)'
        },
        {
            id: '9520204',
            text: 'Kỹ thuật rađa - dẫn đường (9520204)'
        },
        {
            id: '6620124',
            text: 'Kỹ thuật rau, hoa công nghệ cao (6620124)'
        },
        {
            id: '7420202',
            text: 'Kỹ thuật sinh học (7420202)'
        },
        {
            id: '6210413',
            text: 'Kỹ thuật sơn mài và khảm trai (6210413)'
        },
        {
            id: '6480102',
            text: 'Kỹ thuật sửa chữa, lắp ráp máy tính (6480102)'
        },
        {
            id: '9580212',
            text: 'Kỹ thuật tài nguyên nước (9580212)'
        },
        {
            id: '9520122',
            text: 'Kỹ thuật tàu thủy (9520122)'
        },
        {
            id: '9520602',
            text: 'Kỹ thuật thăm dò và khảo sát (9520602)'
        },
        {
            id: '6580204',
            text: 'Kỹ thuật thi công lắp dựng kính xây dựng (6580204)'
        },
        {
            id: '6529008',
            text: 'Kỹ thuật thiết bị cơ điện y tế (6529008)'
        },
        {
            id: '6529006',
            text: 'Kỹ thuật thiết bị điện tử y tế (6529006)'
        },
        {
            id: '6529005',
            text: 'Kỹ thuật thiết bị hình ảnh y tế (6529005)'
        },
        {
            id: '5520215',
            text: 'Kỹ thuật thiết bị radar (5520215)'
        },
        {
            id: '6529009',
            text: 'Kỹ thuật thiết bị sản xuất Dược (6529009)'
        },
        {
            id: '6520212',
            text: 'Kỹ thuật thiết bị thông tin hàng không (6520212)'
        },
        {
            id: '6520214',
            text: 'Kỹ thuật thiết bị viễn thông và nghi khí hàng hải (6520214)'
        },
        {
            id: '6529007',
            text: 'Kỹ thuật thiết bị xét nghiệm y tế (6529007)'
        },
        {
            id: '6520311',
            text: 'Kỹ thuật thoát nước và xử lý nước thải (6520311)'
        },
        {
            id: '7540102',
            text: 'Kỹ thuật thực phẩm (7540102)'
        },
        {
            id: '7520205',
            text: 'Kỹ thuật thủy âm (7520205)'
        },
        {
            id: '9520503',
            text: 'Kỹ thuật trắc địa - bản đồ (9520503)'
        },
        {
            id: '6520221',
            text: 'Kỹ thuật truyền dẫn quang và vô tuyến (6520221)'
        },
        {
            id: '6520220',
            text: 'Kỹ thuật truyền hình cáp (6520220)'
        },
        {
            id: '6529002',
            text: 'Kỹ thuật tua bin (6529002)'
        },
        {
            id: '5529004',
            text: 'Kỹ thuật tua bin khí (5529004)'
        },
        {
            id: '5529003',
            text: 'Kỹ thuật tua bin nước (5529003)'
        },
        {
            id: '9520607',
            text: 'Kỹ thuật tuyển khoáng (9520607)'
        },
        {
            id: '9520309',
            text: 'Kỹ thuật vật liệu (9520309)'
        },
        {
            id: '7520310',
            text: 'Kỹ thuật vật liệu kim loại (7520310)'
        },
        {
            id: '6720307',
            text: 'Kỹ thuật vật lý trị liệu và phục hồi chức năng (6720307)'
        },
        {
            id: '9520208',
            text: 'Kỹ thuật viễn thông (9520208)'
        },
        {
            id: '5510706',
            text: 'Kỹ thuật xăng dầu (5510706)'
        },
        {
            id: '9580201',
            text: 'Kỹ thuật xây dựng (9580201)'
        },
        {
            id: '9580203',
            text: 'Kỹ thuật xây dựng công trình biển (9580203)'
        },
        {
            id: '9580206',
            text: 'Kỹ thuật xây dựng công trình đặc biệt (9580206)'
        },
        {
            id: '9580205',
            text: 'Kỹ thuật xây dựng công trình giao thông (9580205)'
        },
        {
            id: '9580204',
            text: 'Kỹ thuật xây dựng công trình ngầm (9580204)'
        },
        {
            id: '7580202',
            text: 'Kỹ thuật xây dựng công trình thuỷ (7580202)'
        },
        {
            id: '6510116',
            text: 'Kỹ thuật xây dựng mỏ (6510116)'
        },
        {
            id: '9720601',
            text: 'Kỹ thuật xét nghiệm y học (9720601)'
        },
        {
            id: '6720306',
            text: 'Kỹ thuật xét nghiệm y tế (6720306)'
        },
        {
            id: '9520212',
            text: 'Kỹ thuật y sinh (9520212)'
        },
        {
            id: '6840120',
            text: 'Lái tàu bay dân dụng (6840120)'
        },
        {
            id: '6840128',
            text: 'Lái tàu điện (6840128)'
        },
        {
            id: '6840125',
            text: 'Lái tàu đường sắt (6840125)'
        },
        {
            id: '6840127',
            text: 'Lái xe chuyên dụng (6840127)'
        },
        {
            id: '8620201',
            text: 'Lâm học (8620201)'
        },
        {
            id: '5620201',
            text: 'Lâm nghiệp (5620201)'
        },
        {
            id: '7620202',
            text: 'Lâm nghiệp đô thị (7620202)'
        },
        {
            id: '9620205',
            text: 'Lâm sinh (9620205)'
        },
        {
            id: '6620203',
            text: 'Làm vườn - cây cảnh (6620203)'
        },
        {
            id: '5529014',
            text: 'Lặn hướng dẫn tham quan, du lịch (5529014)'
        },
        {
            id: '6529013',
            text: 'Lặn nghiên cứu khảo sát (6529013)'
        },
        {
            id: '6529015',
            text: 'Lặn thi công (6529015)'
        },
        {
            id: '6529012',
            text: 'Lặn trục vớt (6529012)'
        },
        {
            id: '5760104',
            text: 'Lao động - Xã hội (5760104)'
        },
        {
            id: '6510112',
            text: 'Lắp đặt cầu (6510112)'
        },
        {
            id: '6520239',
            text: 'Lắp đặt điện công trình (6520239)'
        },
        {
            id: '6520244',
            text: 'Lắp đặt đường dây tải điện và trạm biến áp có điện áp từ 110 KV trở xuống (6520244)'
        },
        {
            id: '6520243',
            text: 'Lắp đặt đường dây tải điện và trạm biến áp có điện áp từ 220 KV trở lên (6520243)'
        },
        {
            id: '6510113',
            text: 'Lắp đặt giàn khoan (6510113)'
        },
        {
            id: '6520113',
            text: 'Lắp đặt thiết bị cơ khí (6520113)'
        },
        {
            id: '6520240',
            text: 'Lắp đặt thiết bị điện (6520240)'
        },
        {
            id: '6520114',
            text: 'Lắp đặt thiết bị lạnh (6520114)'
        },
        {
            id: '6520241',
            text: 'Lắp đặt, sửa chữa hệ thống truyền dẫn điện đường sắt (6520241)'
        },
        {
            id: '6529010',
            text: 'Lắp đặt, vận hành và sửa chữa bơm, quạt, máy nén khí (6529010)'
        },
        {
            id: '6520112',
            text: 'Lắp ráp hệ thống động lực tàu thủy (6520112)'
        },
        {
            id: '6520111',
            text: 'Lắp ráp ô tô (6520111)'
        },
        {
            id: '6529011',
            text: 'Lắp ráp và thử nghiệm lò hơi, tua bin (6529011)'
        },
        {
            id: '6480208',
            text: 'Lập trình máy tính (6480208)'
        },
        {
            id: '5480212',
            text: 'Lập trình/Phân tích hệ thống (5480212)'
        },
        {
            id: '9460106',
            text: 'Lí thuyết xác suất và thống kê toán học (9460106)'
        },
        {
            id: '7229010',
            text: 'Lịch sử (7229010)'
        },
        {
            id: '9229015',
            text: 'Lịch sử Đảng Cộng sản Việt Nam (9229015)'
        },
        {
            id: '9860209',
            text: 'Lịch sử nghệ thuật quân sự (9860209)'
        },
        {
            id: '9229012',
            text: 'Lịch sử phong trào cộng sản, công nhân quốc tế và giải phóng dân tộc (9229012)'
        },
        {
            id: '9229011',
            text: 'Lịch sử thế giới (9229011)'
        },
        {
            id: '9229013',
            text: 'Lịch sử Việt Nam (9229013)'
        },
        {
            id: '9229004',
            text: 'Logic học (9229004)'
        },
        {
            id: '6340141',
            text: 'Logistic (6340141)'
        },
        {
            id: '9510605',
            text: 'Logistics và quản lý chuỗi cung ứng (9510605)'
        },
        {
            id: '7380101',
            text: 'Luật (7380101)'
        },
        {
            id: '9380103',
            text: 'Luật dân sự và tố tụng dân sự (9380103)'
        },
        {
            id: '9380102',
            text: 'Luật hiến pháp và luật hành chính (9380102)'
        },
        {
            id: '9380104',
            text: 'Luật hình sự và tố tụng hình sự (9380104)'
        },
        {
            id: '9380107',
            text: 'Luật kinh tế (9380107)'
        },
        {
            id: '9380108',
            text: 'Luật quốc tế (9380108)'
        },
        {
            id: '6320305',
            text: 'Lưu trữ (6320305)'
        },
        {
            id: '9320303',
            text: 'Lưu trữ học (9320303)'
        },
        {
            id: '9229012',
            text: 'Lịch sử phong trào cộng sản, công nhân quốc tế và giải phóng dân tộc (9229012)'
        },
        {
            id: '5320303',
            text: 'Lưu trữ và quản lý thông tin (5320303)'
        },
        {
            id: '6520305',
            text: 'Luyện Ferro hợp kim (6520305)'
        },
        {
            id: '6520301',
            text: 'Luyện gang (6520301)'
        },
        {
            id: '5520303',
            text: 'Luyện kim đen (5520303)'
        },
        {
            id: '6520304',
            text: 'Luyện kim màu (6520304)'
        },
        {
            id: '6520302',
            text: 'Luyện thép (6520302)'
        },
        {
            id: '9210231',
            text: 'Lý luận và lịch sử điện ảnh, truyền hình (9210231)'
        },
        {
            id: '9140102',
            text: 'Lý luận và lịch sử giáo dục (9140102)'
        },
        {
            id: '9210101',
            text: 'Lý luận và lịch sử mỹ thuật (9210101)'
        },
        {
            id: '8210401',
            text: 'Lý luận và lịch sử mỹ thuật ứng dụng (8210401)'
        },
        {
            id: '9380106',
            text: 'Lý luận và lịch sử nhà nước và pháp luật (9380106)'
        },
        {
            id: '9210221',
            text: 'Lý luận và lịch sử sân khấu (9210221)'
        },
        {
            id: '9140110',
            text: 'Lý luận và phương pháp dạy học (9140110)'
        },
        {
            id: '9140111',
            text: 'Lý luận và phương pháp dạy học bộ môn (9140111)'
        },
        {
            id: '9220120',
            text: 'Lý luận văn học (9220120)'
        },
        {
            id: '7210231',
            text: 'Lý luận, lịch sử và phê bình điện ảnh, truyền hình (7210231)'
        },
        {
            id: '7210241',
            text: 'Lý luận, lịch sử và phê bình múa (7210241)'
        },
        {
            id: '7210101',
            text: 'Lý luận, lịch sử và phê bình mỹ thuật (7210101)'
        },
        {
            id: '7210221',
            text: 'Lý luận, lịch sử và phê bình sân khấu (7210221)'
        },
        {
            id: '9420115',
            text: 'Lý sinh học (9420115)'
        },
        {
            id: '5210226',
            text: 'Lý thuyết âm nhạc (5210226)'
        },
        {
            id: '9480102',
            text: 'Mạng máy tính và truyền thông dữ liệu (9480102)'
        },
        {
            id: '7340115',
            text: 'Marketing (7340115)'
        },
        {
            id: '6340136',
            text: 'Marketing du lịch (6340136)'
        },
        {
            id: '6340137',
            text: 'Marketing thương mại (6340137)'
        },
        {
            id: '9720157',
            text: 'Mắt (Nhãn khoa) (9720157)'
        },
        {
            id: '6540204',
            text: 'May thời trang (6540204)'
        },
        {
            id: '5580211',
            text: 'Mộc dân dụng (5580211)'
        },
        {
            id: '5210422',
            text: 'Mộc mỹ nghệ (5210422)'
        },
        {
            id: '6580210',
            text: 'Mộc xây dựng và trang trí nội thất (6580210)'
        },
        {
            id: '9440303',
            text: 'Môi trường đất và nước (9440303)'
        },
        {
            id: '9229007',
            text: 'Mỹ học (9229007)'
        },
        {
            id: '7210110',
            text: 'Mỹ thuật đô thị (7210110)'
        },
        {
            id: '8210102',
            text: 'Mỹ thuật tạo hình (8210102)'
        },
        {
            id: '8210410',
            text: 'Mỹ thuật ứng dụng (8210410)'
        },
        {
            id: '5580209',
            text: 'Nề - Hoàn thiện (5580209)'
        },
        {
            id: '8210202',
            text: 'Nghệ thuật âm nhạc (8210202)'
        },
        {
            id: '5210201',
            text: 'Nghệ thuật biểu diễn ca kịch Huế (5210201)'
        },
        {
            id: '5210205',
            text: 'Nghệ thuật biểu diễn cải lương (5210205)'
        },
        {
            id: '5210203',
            text: 'Nghệ thuật biểu diễn chèo (5210203)'
        },
        {
            id: '5210202',
            text: 'Nghệ thuật biểu diễn dân ca (5210202)'
        },
        {
            id: '5210209',
            text: 'Nghệ thuật biểu diễn dân ca quan họ (5210209)'
        },
        {
            id: '5210206',
            text: 'Nghệ thuật biểu diễn kịch múa (5210206)'
        },
        {
            id: '5210210',
            text: 'Nghệ thuật biểu diễn kịch nói (5210210)'
        },
        {
            id: '5210207',
            text: 'Nghệ thuật biểu diễn múa dân gian dân tộc (5210207)'
        },
        {
            id: '5210204',
            text: 'Nghệ thuật biểu diễn tuồng (5210204)'
        },
        {
            id: '5210208',
            text: 'Nghệ thuật biểu diễn xiếc (5210208)'
        },
        {
            id: '9860212',
            text: 'Nghệ thuật chiến dịch (9860212)'
        },
        {
            id: '8210232',
            text: 'Nghệ thuật điện ảnh, truyền hình (8210232)'
        },
        {
            id: '8860208',
            text: 'Nghệ thuật quân sự (8860208)'
        },
        {
            id: '8210222',
            text: 'Nghệ thuật sân khấu (8210222)'
        },
        {
            id: '5340138',
            text: 'Nghiệp vụ bán hàng (5340138)'
        },
        {
            id: '5810203',
            text: 'Nghiệp vụ lễ tân (5810203)'
        },
        {
            id: '5810204',
            text: 'Nghiệp vụ lưu trú (5810204)'
        },
        {
            id: '5810206',
            text: 'Nghiệp vụ nhà hàng (5810206)'
        },
        {
            id: '5810205',
            text: 'Nghiệp vụ nhà hàng, khách sạn (5810205)'
        },
        {
            id: '9720104',
            text: 'Ngoại khoa (9720104)'
        },
        {
            id: '9220201',
            text: 'Ngôn ngữ Anh (9220201)'
        },
        {
            id: '7220211',
            text: 'Ngôn ngữ Ảrập (7220211)'
        },
        {
            id: '7220207',
            text: 'Ngôn ngữ Bồ Đào Nha (7220207)'
        },
        {
            id: '9220109',
            text: 'Ngôn ngữ các dân tộc thiểu số Việt Nam (9220109)'
        },
        {
            id: '7220108',
            text: 'Ngôn ngữ Chăm (7220108)'
        },
        {
            id: '9220205',
            text: 'Ngôn ngữ Đức (9220205)'
        },
        {
            id: '9220210',
            text: 'Ngôn ngữ Hàn Quốc (9220210)'
        },
        {
            id: '7220107',
            text: 'Ngôn ngữ H\'mong(7220107)'
        },
        {
            id: '9229020',
            text: 'Ngôn ngữ học (9229020)'
        },
        {
            id: '6222024',
            text: 'Ngôn ngữ học so sánh, đối chiếu (6222024)'
        },
        {
            id: '7220208',
            text: 'Ngôn ngữ Italia (7220208)'
        },
        {
            id: '5220106',
            text: 'Ngôn ngữ Jrai (5220106)'
        },
        {
            id: '5220107',
            text: 'Ngôn ngữ Khme (5220107)'
        },
        {
            id: '7220106',
            text: 'Ngôn ngữ Khmer (7220106)'
        },
        {
            id: '9220202',
            text: 'Ngôn ngữ Nga (9220202)'
        },
        {
            id: '9220209',
            text: 'Ngôn ngữ Nhật (9220209)'
        },
        {
            id: '9220203',
            text: 'Ngôn ngữ Pháp (9220203)'
        },
        {
            id: '7220206',
            text: 'Ngôn ngữ Tây Ban Nha (7220206)'
        },
        {
            id: '9220204',
            text: 'Ngôn ngữ Trung Quốc (9220204)'
        },
        {
            id: '9220102',
            text: 'Ngôn ngữ Việt Nam (9220102)'
        },
        {
            id: '6520125',
            text: 'Nguội chế tạo (6520125)'
        },
        {
            id: '6520127',
            text: 'Nguội lắp ráp cơ khí (6520127)'
        },
        {
            id: '6520126',
            text: 'Nguội sửa chữa máy công cụ (6520126)'
        },
        {
            id: '5210219',
            text: 'Nhạc công kịch hát dân tộc (5210219)'
        },
        {
            id: '5210220',
            text: 'Nhạc công truyền thống Huế (5210220)'
        },
        {
            id: '7210209',
            text: 'Nhạc Jazz (7210209)'
        },
        {
            id: '9420102',
            text: 'Nhân chủng học (9420102)'
        },
        {
            id: '9310302',
            text: 'Nhân học (9310302)'
        },
        {
            id: '9310613',
            text: 'Nhật Bản học (9310613)'
        },
        {
            id: '9720106',
            text: 'Nhi khoa (9720106)'
        },
        {
            id: '5510301',
            text: 'Nhiệt điện (5510301)'
        },
        {
            id: '9720107',
            text: 'Nội khoa (9720107)'
        },
        {
            id: '7620109',
            text: 'Nông học (7620109)'
        },
        {
            id: '7620101',
            text: 'Nông nghiệp (7620101)'
        },
        {
            id: '5620107',
            text: 'Nông vụ mía đường (5620107)'
        },
        {
            id: '9620301',
            text: 'Nuôi trồng thủy sản (9620301)'
        },
        {
            id: '6620304',
            text: 'Nuôi trồng thủy sản nước mặn, nước lợ (6620304)'
        },
        {
            id: '6620303',
            text: 'Nuôi trồng thủy sản nước ngọt (6620303)'
        },
        {
            id: '5210224',
            text: 'Organ (5210224)'
        },
        {
            id: '6510608',
            text: 'Phân tích các sản phẩm alumin và bauxit (6510608)'
        },
        {
            id: '6510707',
            text: 'Phân tích các sản phẩm lọc dầu (6510707)'
        },
        {
            id: '5860220',
            text: 'Phân tích chất độc quân sự (5860220)'
        },
        {
            id: '6510607',
            text: 'Phân tích cơ lý hóa xi măng (6510607)'
        },
        {
            id: '6320401',
            text: 'Phát hành xuất bản phẩm (6320401)'
        },
        {
            id: '8310313',
            text: 'Phát triển bền vững (8310313)'
        },
        {
            id: '8310315',
            text: 'Phát triển con người (8310315)'
        },
        {
            id: '9620116',
            text: 'Phát triển nông thôn (9620116)'
        },
        {
            id: '9720119',
            text: 'Phẫu thuật tạo hình, tái tạo và thẩm mỹ (9720119)'
        },
        {
            id: '6220203',
            text: 'Phiên dịch tiếng Anh du lịch (6220203)'
        },
        {
            id: '6220201',
            text: 'Phiên dịch tiếng Anh hàng không (6220201)'
        },
        {
            id: '6220202',
            text: 'Phiên dịch tiếng Anh thương mại (6220202)'
        },
        {
            id: '6220205',
            text: 'Phiên dịch tiếng Đức kinh tế, thương mại (6220205)'
        },
        {
            id: '6220204',
            text: 'Phiên dịch tiếng Nhật kinh tế, thương mại (6220204)'
        },
        {
            id: '9860113',
            text: 'Phòng cháy chữa cháy và cứu nạn cứu hộ (9860113)'
        },
        {
            id: '6620309',
            text: 'Phòng và chữa bệnh thủy sản (6620309)'
        },
        {
            id: '5320103',
            text: 'Phóng viên, biên tập (5320103)'
        },
        {
            id: '6320101',
            text: 'Phóng viên, biên tập đài cơ sở (6320101)'
        },
        {
            id: '6210233',
            text: 'Phục vụ điện ảnh, sân khấu (6210233)'
        },
        {
            id: '8460113',
            text: 'Phương pháp toán sơ cấp (8460113)'
        },
        {
            id: '9460103',
            text: 'Phương trình vi phân và tích phân (9460103)'
        },
        {
            id: '7210208',
            text: 'Piano (7210208)'
        },
        {
            id: '8320108',
            text: 'Quan hệ công chúng (8320108)'
        },
        {
            id: '7340408',
            text: 'Quan hệ lao động (7340408)'
        },
        {
            id: '9310206',
            text: 'Quan hệ quốc tế (9310206)'
        },
        {
            id: '5860213',
            text: 'Quân khí (5860213)'
        },
        {
            id: '8340417',
            text: 'Quản lý an toàn và sức khỏe nghề nghiệp (8340417)'
        },
        {
            id: '9720802',
            text: 'Quản lý bệnh viện (9720802)'
        },
        {
            id: '8850104',
            text: 'Quản lý biển đảo và đới bờ (8850104)'
        },
        {
            id: '9860216',
            text: 'Quản lý biên giới và cửa khẩu (9860216)'
        },
        {
            id: '6340411',
            text: 'Quản lý cây xanh đô thị (6340411)'
        },
        {
            id: '5540128',
            text: 'Quản lý chất lượng lương thực, thực phẩm (5540128)'
        },
        {
            id: '9340403',
            text: 'Quản lý công (9340403)'
        },
        {
            id: '8480204',
            text: 'Quản lý công nghệ thông tin (8480204)'
        },
        {
            id: '9510601',
            text: 'Quản lý công nghiệp (9510601)'
        },
        {
            id: '6340413',
            text: 'Quản lý công trình biển (6340413)'
        },
        {
            id: '5340407',
            text: 'Quản lý công trình đô thị (5340407)'
        },
        {
            id: '6340412',
            text: 'Quản lý công trình đường thủy (6340412)'
        },
        {
            id: '9850103',
            text: 'Quản lý đất đai (9850103)'
        },
        {
            id: '9580106',
            text: 'Quản lý đô thị và công trình (9580106)'
        },
        {
            id: '5340128',
            text: 'Quản lý doanh nghiệp (5340128)'
        },
        {
            id: '7340409',
            text: 'Quản lý dự án (7340409)'
        },
        {
            id: '9140114',
            text: 'Quản lý giáo dục (9140114)'
        },
        {
            id: '6340408',
            text: 'Quản lý giao thông đô thị (6340408)'
        },
        {
            id: '8480205',
            text: 'Quản lý Hệ thống thông tin (8480205)'
        },
        {
            id: '7840102',
            text: 'Quản lý hoạt động bay (7840102)'
        },
        {
            id: '6340409',
            text: 'Quản lý khai thác công trình thủy lợi (6340409)'
        },
        {
            id: '5340133',
            text: 'Quản lý kho hàng (5340133)'
        },
        {
            id: '9340412',
            text: 'Quản lý khoa học và công nghệ (9340412)'
        },
        {
            id: '6340410',
            text: 'Quản lý khu đô thị (6340410)'
        },
        {
            id: '6340127',
            text: 'Quản lý kinh doanh điện (6340127)'
        },
        {
            id: '9340410',
            text: 'Quản lý kinh tế (9340410)'
        },
        {
            id: '5340415',
            text: 'Quản lý lao động tiền lương và bảo trợ xã hội (5340415)'
        },
        {
            id: '8510602',
            text: 'Quản lý năng lượng (8510602)'
        },
        {
            id: '6340406',
            text: 'Quản lý nhà đất (6340406)'
        },
        {
            id: '9860109',
            text: 'Quản lý nhà nước về an ninh trật tự (9860109)'
        },
        {
            id: '5620127',
            text: 'Quản lý nông trại (5620127)'
        },
        {
            id: '5510601',
            text: 'Quản lý sản xuất công nghiệp (5510601)'
        },
        {
            id: '5850107',
            text: 'Quản lý tài nguyên biển và hải đảo (5850107)'
        },
        {
            id: '5850101',
            text: 'Quản lý tài nguyên nước (5850101)'
        },
        {
            id: '9620211',
            text: 'Quản lý tài nguyên rừng (9620211)'
        },
        {
            id: '9850101',
            text: 'Quản lý tài nguyên và môi trường (9850101)'
        },
        {
            id: '8810301',
            text: 'Quản lý thể dục thể thao (8810301)'
        },
        {
            id: '5340416',
            text: 'Quản lý thiết bị trường học (5340416)'
        },
        {
            id: '7320205',
            text: 'Quản lý thông tin (7320205)'
        },
        {
            id: '5510918',
            text: 'Quản lý thông tin tư liệu địa chính (5510918)'
        },
        {
            id: '5620126',
            text: 'Quản lý thủy nông (5620126)'
        },
        {
            id: '9620305',
            text: 'Quản lý thủy sản (9620305)'
        },
        {
            id: '6340414',
            text: 'Quản lý tòa nhà (6340414)'
        },
        {
            id: '9860110',
            text: 'Quản lý trật tự an toàn giao thông (9860110)'
        },
        {
            id: '5340132',
            text: 'Quản lý và bán hàng siêu thị (5340132)'
        },
        {
            id: '5340129',
            text: 'Quản lý và kinh doanh du lịch (5340129)'
        },
        {
            id: '5340130',
            text: 'Quản lý và kinh doanh khách sạn (5340130)'
        },
        {
            id: '5340131',
            text: 'Quản lý và kinh doanh nhà hàng và dịch vụ ăn uống (5340131)'
        },
        {
            id: '6620129',
            text: 'Quản lý và kinh doanh nông nghiệp (6620129)'
        },
        {
            id: '5520266',
            text: 'Quản lý và vận hành lưới điện (5520266)'
        },
        {
            id: '6520257',
            text: 'Quản lý vận hành, sửa chữa đường dây và trạm biến áp có điện áp từ 110KV trở xuống (6520257)'
        },
        {
            id: '6520256',
            text: 'Quản lý vận hành, sửa chữa đường dây và trạm biến áp có điện áp từ 220 KV trở lên (6520256)'
        },
        {
            id: '7229042',
            text: 'Quản lý văn hoá (7229042)'
        },
        {
            id: '9319042',
            text: 'Quản lý văn hóa (9319042)'
        },
        {
            id: '9580302',
            text: 'Quản lý xây dựng (9580302)'
        },
        {
            id: '5320403',
            text: 'Quản lý xuất bản phẩm (5320403)'
        },
        {
            id: '9720801',
            text: 'Quản lý Y tế (9720801)'
        },
        {
            id: '7860222',
            text: 'Quân sự cơ sở (7860222)'
        },
        {
            id: '6440203',
            text: 'Quan trắc hải văn (6440203)'
        },
        {
            id: '6510911',
            text: 'Quan trắc khí tượng (6510911)'
        },
        {
            id: '6440204',
            text: 'Quan trắc khí tượng bề mặt (6440204)'
        },
        {
            id: '6440201',
            text: 'Quan trắc khí tượng hàng không (6440201)'
        },
        {
            id: '6440202',
            text: 'Quan trắc khí tượng nông nghiệp (6440202)'
        },
        {
            id: '6340138',
            text: 'Quản trị bán hàng (6340138)'
        },
        {
            id: '6810204',
            text: 'Quản trị buồng phòng (6810204)'
        },
        {
            id: '6480209',
            text: 'Quản trị cơ sở dữ liệu (6480209)'
        },
        {
            id: '8810103',
            text: 'Quản trị dịch vụ du lịch và lữ hành (8810103)'
        },
        {
            id: '6810106',
            text: 'Quản trị dịch vụ giải trí, thể thao (6810106)'
        },
        {
            id: '6340404',
            text: 'Quản trị doanh nghiệp vừa và nhỏ (6340404)'
        },
        {
            id: '6810105',
            text: 'Quản trị du lịch MICE (6810105)'
        },
        {
            id: '5480211',
            text: 'Quản trị hệ thống (5480211)'
        },
        {
            id: '7810201',
            text: 'Quản trị khách sạn (7810201)'
        },
        {
            id: '6810202',
            text: 'Quản trị khu Resort (6810202)'
        },
        {
            id: '9340101',
            text: 'Quản trị kinh doanh (9340101)'
        },
        {
            id: '6340126',
            text: 'Quản trị kinh doanh bất động sản (6340126)'
        },
        {
            id: '6340120',
            text: 'Quản trị kinh doanh lương thực - thực phẩm (6340120)'
        },
        {
            id: '6340124',
            text: 'Quản trị kinh doanh thiết bị vật tư văn phòng (6340124)'
        },
        {
            id: '6840101',
            text: 'Quản trị kinh doanh vận tải biển (6840101)'
        },
        {
            id: '6340117',
            text: 'Quản trị kinh doanh vận tải đường bộ (6340117)'
        },
        {
            id: '6340118',
            text: 'Quản trị kinh doanh vận tải đường sắt (6340118)'
        },
        {
            id: '6340116',
            text: 'Quản trị kinh doanh vận tải đường thủy nội địa (6340116)'
        },
        {
            id: '6340119',
            text: 'Quản trị kinh doanh vận tải hàng không (6340119)'
        },
        {
            id: '6340122',
            text: 'Quản trị kinh doanh vật tư công nghiệp (6340122)'
        },
        {
            id: '6340121',
            text: 'Quản trị kinh doanh vật tư nông nghiệp (6340121)'
        },
        {
            id: '6340123',
            text: 'Quản trị kinh doanh vật tư xây dựng (6340123)'
        },
        {
            id: '6340125',
            text: 'Quản trị kinh doanh xăng dầu và gas (6340125)'
        },
        {
            id: '6810203',
            text: 'Quản trị lễ tân (6810203)'
        },
        {
            id: '6810104',
            text: 'Quản trị lữ hành (6810104)'
        },
        {
            id: '6480210',
            text: 'Quản trị mạng máy tính (6480210)'
        },
        {
            id: '6810206',
            text: 'Quản trị nhà hàng (6810206)'
        },
        {
            id: '7810202',
            text: 'Quản trị nhà hàng và dịch vụ ăn uống (7810202)'
        },
        {
            id: '6340405',
            text: 'Quản trị nhà máy sản xuất may (6340405)'
        },
        {
            id: '9340404',
            text: 'Quản trị nhân lực (9340404)'
        },
        {
            id: '6340401',
            text: 'Quản trị nhân sự (6340401)'
        },
        {
            id: '8340406',
            text: 'Quản trị văn phòng (8340406)'
        },
        {
            id: '9440110',
            text: 'Quang học (9440110)'
        },
        {
            id: '7210236',
            text: 'Quay phim (7210236)'
        },
        {
            id: '9310601',
            text: 'Quốc tế học (9310601)'
        },
        {
            id: '9580105',
            text: 'Quy hoạch vùng và đô thị (9580105)'
        },
        {
            id: '8310317',
            text: 'Quyền con người (8310317)'
        },
        {
            id: '9720501',
            text: 'Răng-Hàm-Mặt (9720501)'
        },
        {
            id: '6520124',
            text: 'Rèn, dập (6520124)'
        },
        {
            id: '9720105',
            text: 'Sản phụ khoa (9720105)'
        },
        {
            id: '6540112',
            text: 'Sản xuất bánh, kẹo (6540112)'
        },
        {
            id: '5510515',
            text: 'Sản xuất bao bì xi măng (5510515)'
        },
        {
            id: '5510521',
            text: 'Sản xuất bê tông nhựa nóng (5510521)'
        },
        {
            id: '5540110',
            text: 'Sản xuất bột ngọt, gia vị (5540110)'
        },
        {
            id: '6510509',
            text: 'Sản xuất các chất vô cơ (6510509)'
        },
        {
            id: '6510704',
            text: 'Sản xuất các sản phẩm lọc dầu (6510704)'
        },
        {
            id: '6510530',
            text: 'Sản xuất cáp điện và thiết bị đầu nối (6510530)'
        },
        {
            id: '6540117',
            text: 'Sản xuất cồn (6540117)'
        },
        {
            id: '5510518',
            text: 'Sản xuất đá bằng cơ giới (5510518)'
        },
        {
            id: '6510529',
            text: 'Sản xuất động cơ điện (6510529)'
        },
        {
            id: '6510531',
            text: 'Sản xuất dụng cụ chỉnh hình (6510531)'
        },
        {
            id: '6510528',
            text: 'Sản xuất dụng cụ đo điện (6510528)'
        },
        {
            id: '6510532',
            text: 'Sản xuất dụng cụ phục hồi chức năng (6510532)'
        },
        {
            id: '6510533',
            text: 'Sản xuất dụng cụ thể thao (6510533)'
        },
        {
            id: '5540122',
            text: 'Sản xuất đường glucoza (5540122)'
        },
        {
            id: '5540123',
            text: 'Sản xuất đường mía (5540123)'
        },
        {
            id: '5510516',
            text: 'Sản xuất gạch Ceramic (5510516)'
        },
        {
            id: '5510517',
            text: 'Sản xuất gạch Granit (5510517)'
        },
        {
            id: '6510536',
            text: 'Sản xuất gốm xây dựng (6510536)'
        },
        {
            id: '6540212',
            text: 'Sản xuất hàng da, giầy (6540212)'
        },
        {
            id: '5210416',
            text: 'Sản xuất hàng mây tre đan (5210416)'
        },
        {
            id: '6510526',
            text: 'Sản xuất khí cụ điện (6510526)'
        },
        {
            id: '5540115',
            text: 'Sản xuất muối công nghiệp (5540115)'
        },
        {
            id: '5540114',
            text: 'Sản xuất muối từ nước biển (5540114)'
        },
        {
            id: '6210235',
            text: 'Sản xuất nhạc cụ (6210235)'
        },
        {
            id: '6540119',
            text: 'Sản xuất nước giải khát (6540119)'
        },
        {
            id: '6510511',
            text: 'Sản xuất phân bón (6510511)'
        },
        {
            id: '6210230',
            text: 'Sản xuất phim (6210230)'
        },
        {
            id: '6210231',
            text: 'Sản xuất phim hoạt hình (6210231)'
        },
        {
            id: '6510525',
            text: 'Sản xuất pin, ắc quy (6510525)'
        },
        {
            id: '6540118',
            text: 'Sản xuất rượu bia (6540118)'
        },
        {
            id: '6510527',
            text: 'Sản xuất sản phẩm cách điện (6510527)'
        },
        {
            id: '6510510',
            text: 'Sản xuất sản phẩm giặt tẩy (6510510)'
        },
        {
            id: '6510537',
            text: 'Sản xuất sản phẩm gốm dân dụng (6510537)'
        },
        {
            id: '6510524',
            text: 'Sản xuất sản phẩm kính, thủy tinh (6510524)'
        },
        {
            id: '6510523',
            text: 'Sản xuất sản phẩm sứ dân dụng (6510523)'
        },
        {
            id: '6510513',
            text: 'Sản xuất sơn (6510513)'
        },
        {
            id: '6510522',
            text: 'Sản xuất sứ xây dựng (6510522)'
        },
        {
            id: '5510535',
            text: 'Sản xuất tấm lợp Fibro xi măng (5510535)'
        },
        {
            id: '5620106',
            text: 'Sản xuất thức ăn chăn nuôi (5620106)'
        },
        {
            id: '6510512',
            text: 'Sản xuất thuốc bảo vệ thực vật (6510512)'
        },
        {
            id: '6640301',
            text: 'Sản xuất thuốc thú y (6640301)'
        },
        {
            id: '6640302',
            text: 'Sản xuất thuốc thủy y (6640302)'
        },
        {
            id: '5210417',
            text: 'Sản xuất tranh (5210417)'
        },
        {
            id: '5510519',
            text: 'Sản xuất vật liệu chịu lửa (5510519)'
        },
        {
            id: '6510507',
            text: 'Sản xuất vật liệu hàn (6510507)'
        },
        {
            id: '6510534',
            text: 'Sản xuất vật liệu không nung và cốt liệu (6510534)'
        },
        {
            id: '6510508',
            text: 'Sản xuất vật liệu nổ công nghiệp (6510508)'
        },
        {
            id: '5510520',
            text: 'Sản xuất vật liệu phụ trợ dùng trong đóng tàu (5510520)'
        },
        {
            id: '6510514',
            text: 'Sản xuất xi măng (6510514)'
        },
        {
            id: '7210203',
            text: 'Sáng tác âm nhạc (7210203)'
        },
        {
            id: '7220110',
            text: 'Sáng tác văn học (7220110)'
        },
        {
            id: '9420101',
            text: 'Sinh học (9420101)'
        },
        {
            id: '8420114',
            text: 'Sinh học thực nghiệm (8420114)'
        },
        {
            id: '7420203',
            text: 'Sinh học ứng dụng (7420203)'
        },
        {
            id: '9420104',
            text: 'Sinh lý học người và động vật (9420104)'
        },
        {
            id: '9420112',
            text: 'Sinh lý học thực vật (9420112)'
        },
        {
            id: '9640106',
            text: 'Sinh sản và bệnh sinh sản gia súc (9640106)'
        },
        {
            id: '9420120',
            text: 'Sinh thái học (9420120)'
        },
        {
            id: '6620205',
            text: 'Sinh vật cảnh (6620205)'
        },
        {
            id: '5210412',
            text: 'Sơn mài (5210412)'
        },
        {
            id: '5860216',
            text: 'Sử dụng và sửa chữa thiết bị vô tuyến phòng không (5860216)'
        },
        {
            id: '7140221',
            text: 'Sư phạm Âm nhạc (7140221)'
        },
        {
            id: '7140246',
            text: 'Sư phạm công nghệ (7140246)'
        },
        {
            id: '6140201',
            text: 'Sư phạm dạy nghề (6140201)'
        },
        {
            id: '7140219',
            text: 'Sư phạm Địa lý (7140219)'
        },
        {
            id: '7140212',
            text: 'Sư phạm Hóa học (7140212)'
        },
        {
            id: '7140247',
            text: 'Sư phạm khoa học tự nhiên (7140247)'
        },
        {
            id: '7140214',
            text: 'Sư phạm Kỹ thuật công nghiệp (7140214)'
        },
        {
            id: '7140215',
            text: 'Sư phạm Kỹ thuật nông nghiệp (7140215)'
        },
        {
            id: '7140218',
            text: 'Sư phạm Lịch sử (7140218)'
        },
        {
            id: '7140222',
            text: 'Sư phạm Mỹ thuật (7140222)'
        },
        {
            id: '7140245',
            text: 'Sư phạm nghệ thuật (7140245)'
        },
        {
            id: '7140217',
            text: 'Sư phạm Ngữ văn (7140217)'
        },
        {
            id: '7140213',
            text: 'Sư phạm Sinh học (7140213)'
        },
        {
            id: '7140231',
            text: 'Sư phạm Tiếng Anh (7140231)'
        },
        {
            id: '7140223',
            text: 'Sư phạm Tiếng Bana (7140223)'
        },
        {
            id: '7140228',
            text: 'Sư phạm Tiếng Chăm (7140228)'
        },
        {
            id: '7140235',
            text: 'Sư phạm Tiếng Đức (7140235)'
        },
        {
            id: '7140224',
            text: 'Sư phạm Tiếng Êđê (7140224)'
        },
        {
            id: '7140237',
            text: 'Sư phạm Tiếng Hàn Quốc (7140237)'
        },
        {
            id: '7140227',
            text: 'Sư phạm Tiếng H\'mong(7140227)'
        },
        {
            id: '7140225',
            text: 'Sư phạm Tiếng Jrai (7140225)'
        },
        {
            id: '7140226',
            text: 'Sư phạm Tiếng Khmer (7140226)'
        },
        {
            id: '7140229',
            text: 'Sư phạm Tiếng M\'nông(7140229)'
        },
        {
            id: '7140232',
            text: 'Sư phạm Tiếng Nga (7140232)'
        },
        {
            id: '7140236',
            text: 'Sư phạm Tiếng Nhật (7140236)'
        },
        {
            id: '7140233',
            text: 'Sư phạm Tiếng Pháp (7140233)'
        },
        {
            id: '7140234',
            text: 'Sư phạm Tiếng Trung Quốc (7140234)'
        },
        {
            id: '7140230',
            text: 'Sư phạm Tiếng Xê đăng (7140230)'
        },
        {
            id: '7140210',
            text: 'Sư phạm Tin học (7140210)'
        },
        {
            id: '7140209',
            text: 'Sư phạm Toán học (7140209)'
        },
        {
            id: '7140211',
            text: 'Sư phạm Vật lý (7140211)'
        },
        {
            id: '5520148',
            text: 'Sửa chữa cơ khí động lực (5520148)'
        },
        {
            id: '6520137',
            text: 'Sửa chữa cơ khí ngành giấy (6520137)'
        },
        {
            id: '6520140',
            text: 'Sửa chữa cơ máy mỏ (6520140)'
        },
        {
            id: '6520232',
            text: 'Sửa chữa điện máy công trình (6520232)'
        },
        {
            id: '6520231',
            text: 'Sửa chữa điện máy mỏ (6520231)'
        },
        {
            id: '6520237',
            text: 'Sửa chữa đồng hồ đo điện, nhiệt, áp lực (6520237)'
        },
        {
            id: '5520236',
            text: 'Sửa chữa đồng hồ đo thời gian (5520236)'
        },
        {
            id: '6520234',
            text: 'Sửa chữa đường dây tải điện đang vận hành (6520234)'
        },
        {
            id: '6520145',
            text: 'Sửa chữa máy nâng chuyển (6520145)'
        },
        {
            id: '6520130',
            text: 'Sửa chữa máy tàu biển (6520130)'
        },
        {
            id: '6520131',
            text: 'Sửa chữa máy tàu thủy (6520131)'
        },
        {
            id: '6520146',
            text: 'Sửa chữa máy thi công xây dựng (6520146)'
        },
        {
            id: '6520144',
            text: 'Sửa chữa thiết bị chế biến dầu khí (6520144)'
        },
        {
            id: '6520135',
            text: 'Sửa chữa thiết bị chế biến đường (6520135)'
        },
        {
            id: '6520134',
            text: 'Sửa chữa thiết bị chế biến gỗ (6520134)'
        },
        {
            id: '6520136',
            text: 'Sửa chữa thiết bị chế biến lương thực, thực phẩm (6520136)'
        },
        {
            id: '6520132',
            text: 'Sửa chữa thiết bị dệt (6520132)'
        },
        {
            id: '6520238',
            text: 'Sửa chữa thiết bị đo lường trọng lượng (6520238)'
        },
        {
            id: '6520141',
            text: 'Sửa chữa thiết bị hóa chất (6520141)'
        },
        {
            id: '6520138',
            text: 'Sửa chữa thiết bị in (6520138)'
        },
        {
            id: '6510718',
            text: 'Sửa chữa thiết bị khai thác dầu khí (6510718)'
        },
        {
            id: '6520143',
            text: 'Sửa chữa thiết bị khoan dầu khí (6520143)'
        },
        {
            id: '6520142',
            text: 'Sửa chữa thiết bị luyện kim (6520142)'
        },
        {
            id: '6520133',
            text: 'Sửa chữa thiết bị may (6520133)'
        },
        {
            id: '6520139',
            text: 'Sửa chữa thiết bị mỏ hầm lò (6520139)'
        },
        {
            id: '6520235',
            text: 'Sửa chữa thiết bị tự động hóa (6520235)'
        },
        {
            id: '5860218',
            text: 'Sửa chữa và khai thác khí tài hóa học (5860218)'
        },
        {
            id: '5860217',
            text: 'Sửa chữa xe máy công binh (5860217)'
        },
        {
            id: '6510119',
            text: 'Sửa chữa, bảo trì cảng hàng không (6510119)'
        },
        {
            id: '6520147',
            text: 'Sửa chữa, lắp đặt thiết bị cơ khí xi măng (6520147)'
        },
        {
            id: '6520233',
            text: 'Sửa chữa, lắp đặt thiết bị điện xi măng (6520233)'
        },
        {
            id: '5520128',
            text: 'Sửa chữa, lắp ráp xe máy (5520128)'
        },
        {
            id: '5520129',
            text: 'Sửa chữa, vận hành tàu cuốc (5520129)'
        },
        {
            id: '9720155',
            text: 'Tai-Mũi-Họng (9720155)'
        },
        {
            id: '9340201',
            text: 'Tài chính - Ngân hàng (9340201)'
        },
        {
            id: '6340201',
            text: 'T ài chính doanh nghiệp (6340201)'
        },
        {
            id: '6340203',
            text: 'T ài chính tín dụng (6340203)'
        },
        {
            id: '9310401',
            text: 'Tâm lý học (9310401)'
        },
        {
            id: '5810402',
            text: 'Tạo mẫu và chăm sóc sắc đẹp (5810402)'
        },
        {
            id: '9860112',
            text: 'Tham mưu, chỉ huy công an nhân dân (9860112)'
        },
        {
            id: '7210205',
            text: 'Thanh nhạc (7210205)'
        },
        {
            id: '5810301',
            text: 'Thể dục thể thao (5810301)'
        },
        {
            id: '5210415',
            text: 'Thêu ren mỹ thuật (5210415)'
        },
        {
            id: '9860111',
            text: 'Thi hành án hình sự và hỗ trợ tư pháp (9860111)'
        },
        {
            id: '6510708',
            text: 'Thí nghiệm các sản phẩm hóa dầu (6510708)'
        },
        {
            id: '6520260',
            text: 'Thí nghiệm điện (6520260)'
        },
        {
            id: '6510606',
            text: 'Thí nghiệm và kiểm tra chất lượng cầu đường bộ (6510606)'
        },
        {
            id: '5510120',
            text: 'Thí nghiệm và kiểm tra chất lượng công trình xây dựng (5510120)'
        },
        {
            id: '9440101',
            text: 'Thiên văn học (9440101)'
        },
        {
            id: '5580103',
            text: 'Thiết kế cảnh quan, hoa viên (5580103)'
        },
        {
            id: '8210402',
            text: 'Thiết kế công nghiệp (8210402)'
        },
        {
            id: '5210421',
            text: 'Thiết kế đồ gỗ (5210421)'
        },
        {
            id: '8210403',
            text: 'Thiết kế đồ họa (8210403)'
        },
        {
            id: '5580101',
            text: 'Thiết kế kiến trúc (5580101)'
        },
        {
            id: '6480103',
            text: 'Thiết kế mạch điện tử trên máy tính (6480103)'
        },
        {
            id: '5540207',
            text: 'Thiết kế may đo áo dài (5540207)'
        },
        {
            id: '6210405',
            text: 'Thiết kế mỹ thuật sân khấu - điện ảnh (6210405)'
        },
        {
            id: '8210406',
            text: 'Thiết kế mỹ thuật sân khấu, điện ảnh (8210406)'
        },
        {
            id: '8580408',
            text: 'Thiết kế nội thất (8580408)'
        },
        {
            id: '9140116',
            text: 'Thiết kế phương tiện giáo dục, giảng dạy (9140116)'
        },
        {
            id: '6210420',
            text: 'Thiết kế tạo dáng, tạo mẫu sản phẩm vật liệu xây dựng (6210420)'
        },
        {
            id: '8210404',
            text: 'Thiết kế thời trang (8210404)'
        },
        {
            id: '6210419',
            text: 'Thiết kế trang trí sản phẩm, bao bì (6210419)'
        },
        {
            id: '6480217',
            text: 'Thiết kế trang Web (6480217)'
        },
        {
            id: '5480218',
            text: 'Thiết kế và quản lý Website (5480218)'
        },
        {
            id: '9460201',
            text: 'Thống kê (9460201)'
        },
        {
            id: '6460202',
            text: 'Thống kê doanh nghiệp (6460202)'
        },
        {
            id: '9310107',
            text: 'Thống kê kinh tế (9310107)'
        },
        {
            id: '7320201',
            text: 'Thông tin - thư viện (7320201)'
        },
        {
            id: '5320204',
            text: 'Thông tin đối ngoại (5320204)'
        },
        {
            id: '9320202',
            text: 'Thông tin học (9320202)'
        },
        {
            id: '6840123',
            text: 'Thông tin tín hiệu đường sắt (6840123)'
        },
        {
            id: '6320306',
            text: 'Thư ký (6320306)'
        },
        {
            id: '6320308',
            text: 'Thư ký văn phòng (6320308)'
        },
        {
            id: '6320201',
            text: 'Thư viện (6320201)'
        },
        {
            id: '5320203',
            text: 'Thư viện - Thiết bị trường học (5320203)'
        },
        {
            id: '9640101',
            text: 'Thú y (9640101)'
        },
        {
            id: '9420111',
            text: 'Thực vật học (9420111)'
        },
        {
            id: '6540211',
            text: 'Thuộc da (6540211)'
        },
        {
            id: '7340122',
            text: 'Thương mại điện tử (7340122)'
        },
        {
            id: '5510302',
            text: 'Thủy điện (5510302)'
        },
        {
            id: '5620125',
            text: 'Thủy lợi tổng hợp (5620125)'
        },
        {
            id: '9420108',
            text: 'Thủy sinh vật học (9420108)'
        },
        {
            id: '6440207',
            text: 'Thủy văn (6440207)'
        },
        {
            id: '9440224',
            text: 'Thủy văn học (9440224)'
        },
        {
            id: '6220206',
            text: 'Tiếng Anh (6220206)'
        },
        {
            id: '5220210',
            text: 'Tiếng Đức (5220210)'
        },
        {
            id: '6220211',
            text: 'Tiếng Hàn Quốc (6220211)'
        },
        {
            id: '6220214',
            text: 'Tiếng Khơ (6220214)'
        },
        {
            id: '6220215',
            text: 'Tiếng Lào (6220215)'
        },
        {
            id: '5220207',
            text: 'Tiếng Nga (5220207)'
        },
        {
            id: '6220212',
            text: 'Tiếng Nhật (6220212)'
        },
        {
            id: '6220208',
            text: 'Tiếng Pháp (6220208)'
        },
        {
            id: '6220213',
            text: 'Tiếng Thái (6220213)'
        },
        {
            id: '6220209',
            text: 'Tiếng Trung Quốc (6220209)'
        },
        {
            id: '7220101',
            text: 'Tiếng Việt và văn hóa Việt Nam (7220101)'
        },
        {
            id: '6480206',
            text: 'Tin học ứng dụng (6480206)'
        },
        {
            id: '6480204',
            text: 'Tin học văn phòng (6480204)'
        },
        {
            id: '6480205',
            text: 'Tin học viễn thông ứng dụng (6480205)'
        },
        {
            id: '9860117',
            text: 'Tình báo an ninh (9860117)'
        },
        {
            id: '9860217',
            text: 'Tình báo quân sự (9860217)'
        },
        {
            id: '6272041',
            text: 'Tổ chức quản lý dược (6272041)'
        },
        {
            id: '5210237',
            text: 'Tổ chức sự kiện (5210237)'
        },
        {
            id: '9840103',
            text: 'Tổ chức và quản lý vận tải (9840103)'
        },
        {
            id: '7720801',
            text: 'Tổ chức và quản lý y tế (7720801)'
        },
        {
            id: '7460115',
            text: 'Toán cơ (7460115)'
        },
        {
            id: '9460102',
            text: 'Toán giải tích (9460102)'
        },
        {
            id: '9460101',
            text: 'Toán học (9460101)'
        },
        {
            id: '9310108',
            text: 'Toán kinh tế (9310108)'
        },
        {
            id: '9460117',
            text: 'Toán tin (9460117)'
        },
        {
            id: '9460112',
            text: 'Toán ứng dụng (9460112)'
        },
        {
            id: '9380105',
            text: 'Tội phạm học và phòng ngừa tội phạm (9380105)'
        },
        {
            id: '9229009',
            text: 'Tôn giáo học (9229009)'
        },
        {
            id: '6510907',
            text: 'Trắc địa - địa hình - địa chính (6510907)'
        },
        {
            id: '6510910',
            text: 'Trắc địa công trình (6510910)'
        },
        {
            id: '6210418',
            text: 'Trang trí nội thất (6210418)'
        },
        {
            id: '9229001',
            text: 'Triết học (9229001)'
        },
        {
            id: '5860207',
            text: 'Trinh sát (5860207)'
        },
        {
            id: '9860101',
            text: 'Trinh sát an ninh (9860101)'
        },
        {
            id: '5860208',
            text: 'Trinh sát biên phòng (5860208)'
        },
        {
            id: '9860102',
            text: 'Trinh sát cảnh sát (9860102)'
        },
        {
            id: '5860209',
            text: 'Trinh sát đặc nhiệm (5860209)'
        },
        {
            id: '5860210',
            text: 'Trinh sát kỹ thuật (5860210)'
        },
        {
            id: '7860231',
            text: 'Trình sát kỹ thuật (7860231)'
        },
        {
            id: '9860221',
            text: 'Trinh sát quân sự (9860221)'
        },
        {
            id: '6620114',
            text: 'Trồng cây ăn quả (6620114)'
        },
        {
            id: '6620113',
            text: 'Trồng cây công nghiệp (6620113)'
        },
        {
            id: '6620111',
            text: 'Trồng cây lương thực, thực phẩm (6620111)'
        },
        {
            id: '5620112',
            text: 'Trồng rau (5620112)'
        },
        {
            id: '5620109',
            text: 'Trồng trọt (5620109)'
        },
        {
            id: '5620110',
            text: 'Trồng trọt và bảo vệ thực vật (5620110)'
        },
        {
            id: '9310612',
            text: 'Trung Quốc học (9310612)'
        },
        {
            id: '6510117',
            text: 'Trùng tu di tích lịch sử (6510117)'
        },
        {
            id: '7320104',
            text: 'Truyền thông đa phương tiện (7320104)'
        },
        {
            id: '9320105',
            text: 'Truyền thông đại chúng (9320105)'
        },
        {
            id: '7320107',
            text: 'Truyền thông quốc tế (7320107)'
        },
        {
            id: '6480104',
            text: 'Truyền thông và mạng máy tính (6480104)'
        },
        {
            id: '6520264',
            text: 'Tự động hóa công nghiệp (6520264)'
        },
        {
            id: '9720108',
            text: 'Ung thư (9720108)'
        },
        {
            id: '6520182',
            text: 'Vận hành cần, cầu trục (6520182)'
        },
        {
            id: '6520245',
            text: 'Vận hành điện trong nhà máy điện (6520245)'
        },
        {
            id: '6520251',
            text: 'Vận hành điện trong nhà máy thủy điện (6520251)'
        },
        {
            id: '6840113',
            text: 'Vận hành khai thác máy tàu (6840113)'
        },
        {
            id: '5520186',
            text: 'Vận hành máy đóng cọc và khoan cọc nhồi (5520186)'
        },
        {
            id: '5520187',
            text: 'Vận hành máy nông nghiệp (5520187)'
        },
        {
            id: '5840113',
            text: 'Vận hành máy tàu thủy (5840113)'
        },
        {
            id: '6520184',
            text: 'Vận hành máy thi công mặt đường (6520184)'
        },
        {
            id: '6520183',
            text: 'Vận hành máy thi công nền (6520183)'
        },
        {
            id: '6520190',
            text: 'Vận hành máy và thiết bị hóa chất (6520190)'
        },
        {
            id: '6520185',
            text: 'Vận hành máy xây dựng (6520185)'
        },
        {
            id: '6520254',
            text: 'Vận hành nhà máy điện hạt nhân (6520254)'
        },
        {
            id: '6520247',
            text: 'Vận hành nhà máy nhiệt điện (6520247)'
        },
        {
            id: '6520246',
            text: 'Vận hành nhà máy thủy điện (6520246)'
        },
        {
            id: '6510712',
            text: 'Vận hành thiết bị chế biến dầu khí (6510712)'
        },
        {
            id: '6520252',
            text: 'Vận hành thiết bị điện và đo lường điều khiển trên tàu thủy (6520252)'
        },
        {
            id: '6510709',
            text: 'Vận hành thiết bị hóa dầu (6510709)'
        },
        {
            id: '6510713',
            text: 'Vận hành thiết bị khai thác dầu khí (6510713)'
        },
        {
            id: '6510714',
            text: 'Vận hành thiết bị lọc dầu (6510714)'
        },
        {
            id: '6511011',
            text: 'Vận hành thiết bị mỏ hầm lò (6511011)'
        },
        {
            id: '6510715',
            text: 'Vận hành thiết bị sản xuất phân đạm từ khí dầu mỏ (6510715)'
        },
        {
            id: '6511007',
            text: 'Vận hành thiết bị sàng tuyển quặng kim loại (6511007)'
        },
        {
            id: '6511006',
            text: 'Vận hành thiết bị sàng tuyển than (6511006)'
        },
        {
            id: '6840116',
            text: 'Vận hành thiết bị xếp dỡ hàng hóa hàng hải (6840116)'
        },
        {
            id: '6520253',
            text: 'Vận hành tổ máy phát điện Diesel (6520253)'
        },
        {
            id: '6511012',
            text: 'Vận hành trạm khí hóa than (6511012)'
        },
        {
            id: '6510710',
            text: 'Vận hành trạm phân phối các sản phẩm dầu khí (6510710)'
        },
        {
            id: '6510711',
            text: 'Vận hành trạm sản xuất khí, khí hóa lỏng (6510711)'
        },
        {
            id: '5510716',
            text: 'Vận hành trạm và đường ống dẫn dầu khí (5510716)'
        },
        {
            id: '6520250',
            text: 'Vận hành trạm, mạng điện (6520250)'
        },
        {
            id: '6520249',
            text: 'Vận hành và sửa chữa trạm bơm điện (6520249)'
        },
        {
            id: '6520248',
            text: 'Vận hành và sửa chữa trạm thủy điện (6520248)'
        },
        {
            id: '6520189',
            text: 'Vận hành, sửa chữa máy tàu cá (6520189)'
        },
        {
            id: '6520188',
            text: 'Vận hành, sửa chữa máy thi công đường sắt (6520188)'
        },
        {
            id: '6520255',
            text: 'Vận hành, sửa chữa thiết bị lạnh (6520255)'
        },
        {
            id: '6511013',
            text: 'Vận hành, sửa chữa trạm xử lý nước thải mỏ hầm lò (6511013)'
        },
        {
            id: '7220112',
            text: 'Văn hóa các dân tộc thiểu số Việt Nam (7220112)'
        },
        {
            id: '9229041',
            text: 'Văn hóa dân gian (9229041)'
        },
        {
            id: '9229040',
            text: 'Văn hóa học (9229040)'
        },
        {
            id: '8319043',
            text: 'Văn hóa so sánh (8319043)'
        },
        {
            id: '5210236',
            text: 'Văn hóa, văn nghệ quần chúng (5210236)'
        },
        {
            id: '9229030',
            text: 'Văn học (9229030)'
        },
        {
            id: '9220125',
            text: 'Văn học dân gian (9220125)'
        },
        {
            id: '9220242',
            text: 'Văn học nước ngoài (9220242)'
        },
        {
            id: '8229031',
            text: 'Văn học so sánh (8229031)'
        },
        {
            id: '9220121',
            text: 'Văn học Việt Nam (9220121)'
        },
        {
            id: '6840130',
            text: 'Vận tải hành khách, hàng hóa đường sắt (6840130)'
        },
        {
            id: '5320302',
            text: 'Văn thư - lưu trữ (5320302)'
        },
        {
            id: '6320301',
            text: 'Văn thư hành chính (6320301)'
        },
        {
            id: '9440125',
            text: 'Vật liệu cao phân tử và tổ hợp (9440125)'
        },
        {
            id: '9440123',
            text: 'Vật liệu điện tử (9440123)'
        },
        {
            id: '9440127',
            text: 'Vật liệu quang học, quang điện tử và quang tử (9440127)'
        },
        {
            id: '9440104',
            text: 'Vật lý chất rắn (9440104)'
        },
        {
            id: '9440111',
            text: 'Vật lý địa cầu (9440111)'
        },
        {
            id: '7440102',
            text: 'Vật lý học (7440102)'
        },
        {
            id: '9520401',
            text: 'Vật lý kỹ thuật (9520401)'
        },
        {
            id: '9440103',
            text: 'Vật lý lý thuyết và vật lý toán (9440103)'
        },
        {
            id: '9440106',
            text: 'Vật lý nguyên tử và hạt nhân (9440106)'
        },
        {
            id: '9440105',
            text: 'Vật lý vô tuyến và điện tử (9440105)'
        },
        {
            id: '6869001',
            text: 'Vệ sỹ (6869001)'
        },
        {
            id: '5480213',
            text: 'Vẽ thiết kế mỹ thuật có trợ giúp bằng máy tính (5480213)'
        },
        {
            id: '6480214',
            text: 'Vẽ và thiết kế trên máy tính (6480214)'
        },
        {
            id: '6420203',
            text: 'Vi sinh - hóa sinh (6420203)'
        },
        {
            id: '9420107',
            text: 'Vi sinh vật học (9420107)'
        },
        {
            id: '9310630',
            text: 'Việt Nam học (9310630)'
        },
        {
            id: '5210223',
            text: 'Violon (5210223)'
        },
        {
            id: '5860214',
            text: 'Vũ khí bộ binh (5860214)'
        },
        {
            id: '9310301',
            text: 'Xã hội học (9310301)'
        },
        {
            id: '5580203',
            text: 'Xây dựng cầu đường (5580203)'
        },
        {
            id: '6580205',
            text: 'Xây dựng cầu đường bộ (6580205)'
        },
        {
            id: '5510115',
            text: 'Xây dựng công trình mỏ (5510115)'
        },
        {
            id: '6510109',
            text: 'Xây dựng công trình thủy (6510109)'
        },
        {
            id: '5510114',
            text: 'Xây dựng công trình thủy điện (5510114)'
        },
        {
            id: '5580202',
            text: 'Xây dựng dân dụng và công nghiệp (5580202)'
        },
        {
            id: '9310202',
            text: 'Xây dựng Đảng và Chính quyền nhà nước (9310202)'
        },
        {
            id: '6510110',
            text: 'Xây dựng và bảo dưỡng công trình giao thông đường sắt (6510110)'
        },
        {
            id: '6510108',
            text: 'Xây dựng và hoàn thiện công trình thủy lợi (6510108)'
        },
        {
            id: '5520242',
            text: 'Xây lắp đường dây và trạm điện (5520242)'
        },
        {
            id: '6840117',
            text: 'Xếp dỡ cơ giới tổng hợp (6840117)'
        },
        {
            id: '5520306',
            text: 'Xử lý chất thải công nghiệp và y tế (5520306)'
        },
        {
            id: '6520307',
            text: 'Xử lý chất thải trong công nghiệp đóng tàu (6520307)'
        },
        {
            id: '6520310',
            text: 'Xử lý chất thải trong sản xuất cao su (6520310)'
        },
        {
            id: '6520308',
            text: 'Xử lý chất thải trong sản xuất thép (6520308)'
        },
        {
            id: '6850109',
            text: 'Xử lý dầu tràn trên biển (6850109)'
        },
        {
            id: '6480207',
            text: 'Xử lý dữ liệu (6480207)'
        },
        {
            id: '6520309',
            text: 'Xử lý nước thải công nghiệp (6520309)'
        },
        {
            id: '6850110',
            text: 'Xử lý rác thải (6850110)'
        },
        {
            id: '9320401',
            text: 'Xuất bản (9320401)'
        },
        {
            id: '8729004',
            text: 'Y học biển (8729004)'
        },
        {
            id: '9720113',
            text: 'Y học cổ truyền (9720113)'
        },
        {
            id: '9720163',
            text: 'Y học dự phòng (9720163)'
        },
        {
            id: '8729001',
            text: 'Y học gia đình (8729001)'
        },
        {
            id: '8729003',
            text: 'Y học Quân sự (8729003)'
        },
        {
            id: '7720101',
            text: 'Y khoa (7720101)'
        },
        {
            id: '7729001',
            text: 'Y sinh học thể dục thể thao (7729001)'
        },
        {
            id: '5720302',
            text: 'Y sỹ (5720302)'
        },
        {
            id: '6720302',
            text: 'Y sỹ đa khoa (6720302)'
        },
        {
            id: '5720201',
            text: 'Y sỹ y học cổ truyền (5720201)'
        },
        {
            id: '5720303',
            text: 'Y sỹ y học dự phòng (5720303)'
        },
        {
            id: '9720701',
            text: 'Y tế công cộng (9720701)'
        },
        {
            id: '5511003',
            text: 'Công nghệ hoàn thiện xuất bản phẩm (5511003)'
        },
        {
            id: '6540301',
            text: 'Công nghệ chế bản điện tử (6540301)'
        },
        {
            id: '7310205',
            text: 'Quản lý nhà nước (7310205)'
        },
        {
            id: '7140103',
            text: 'Công nghệ giáo dục (7140103)'
        },
        {
            id: '73403',
            text: 'Kế toán - Kiểm toán (73403)'
        },
        {
            id: '7140249',
            text: 'Sư phạm Lịch sử - Địa lý (7140249)'
        },
        {
            id: '7310109',
            text: 'Kinh tế số (7310109)'
        },
        {
            id: '7340205',
            text: 'Công nghệ tài chính (7340205)'
        },
        {
            id: '7460108',
            text: 'Khoa học dữ liệu (7460108)'
        },
        {
            id: '7480107',
            text: 'Trí tuệ nhân tạo (7480107)'
        },
        {
            id: '7520138',
            text: 'Kỹ thuật hàng hải (7520138)'
        },
        {
            id: '77201',
            text: 'Y học (77201)'
        },
        {
            id: '73102',
            text: 'Khoa học chính trị (73102)'
        },
        {
            id: '75802',
            text: 'Xây dựng (75802)'
        }
    ];

    const SelectAdapter_HinhThucDaoTao = [
        { id: '00', text: 'Chính quy' },
        { id: '01', text: 'Chuyển đổi' },
        { id: '02', text: 'Liên thông' },
        { id: '03', text: 'Văn bằng 2' },
        { id: 'BD', text: 'Bồi dưỡng' },
        { id: 'BT', text: 'Bổ túc văn hóa' },
        { id: 'CT', text: 'Chuyên tu' },
        { id: 'DTTX', text: 'Đào tạo từ xa' },
        { id: 'MR', text: 'Mở rộng' },
        { id: 'TC', text: 'Tại Chức' },
        { id: 'VHVL', text: 'Vừa học vừa làm' },
        { id: 'CXD', text: 'Chưa xác định' },
        { id: 'LK', text: 'Liên kết' },
        { id: 'TT', text: 'Tập trung' },
        { id: 'KTT', text: 'Không tập trung' },
        { id: 'KHAC', text: 'Khác' }
    ];

    const SelectAdapter_LoaiVanBang_ChinhTri = [
        { id: '07', text: 'Trung cấp' },
        { id: '08', text: 'Sơ cấp' },
        { id: '09', text: 'Cao cấp' }
    ];

    const SelectAdapter_LoaiNgoaiNgu = [
        { id: '00', text: 'Chưa xác định' },
        { id: '01', text: 'Tiếng Anh' },
        { id: '02', text: 'Tiếng Nga' },
        { id: '03', text: 'Tiếng Pháp' },
        { id: '04', text: 'Tiếng Đức' },
        { id: '05', text: 'Tiếng Trung Quốc' },
        { id: '06', text: 'Ngoại ngữ khác' }
    ];

    const SelectAdapter_XepLoaiChuyenMon = [
        { id: '00', text: 'Chưa xác định' },
        { id: '01', text: 'Hoàn thành xuất sắc nhiệm vụ' },
        { id: '02', text: 'Hoàn thành tốt nhiệm vụ' },
        { id: '03', text: 'Hoàn thành nhiệm vụ' },
        { id: '04', text: 'Không hoàn thành nhiệm vụ' }
    ];

    const SelectAdapter_HinhThucKhenThuong = [
        { id: '00', text: 'Huân chương' },
        { id: '01', text: 'Huy chương' },
        { id: '02', text: 'Danh hiệu vinh dự nhà nước' },
        { id: '03', text: 'Giải thưởng Hồ Chí Minh - Nhà nước' },
        { id: '04', text: 'Kỷ niệm chương' },
        { id: '05', text: 'Bằng khen' },
        { id: '06', text: 'Giấy khen' },
        { id: '07', text: 'Chưa xác định' }
    ];

    const SelectAdapter_HinhThucKyLuat = [
        { id: '01', text: 'Khiển trách' },
        { id: '02', text: 'Cảnh cáo' },
        { id: '03', text: 'Cách chức' },
        { id: '04', text: 'Bãi nhiệm' },
        { id: '05', text: 'Hạ bậc lương' },
        { id: '06', text: 'Giáng chức' },
        { id: '07', text: 'Buộc thôi việc' },
        { id: '99', text: 'Khác' }
    ];

    const SelectAdapter_QuanHeGiaDinh = (type = 'giaCanhBanThan') => {
        if (type == 'giaCanhBanThan')
            return [
                { id: '03', text: 'Cha' },
                { id: '04', text: 'Mẹ' },
                { id: '05', text: 'Vợ' },
                { id: '06', text: 'Chồng' },
                { id: '07', text: 'Con' },
                { id: '08', text: 'Anh' },
                { id: '09', text: 'Chị' },
                { id: '10', text: 'Em' }
            ];
        else if (type == 'giaCanhGiaDinh')
            return [
                { id: '03', text: 'Cha' },
                { id: '04', text: 'Mẹ' },
                { id: '08', text: 'Anh' },
                { id: '09', text: 'Chị' },
                { id: '10', text: 'Em' }
            ];
    };

    const SelectAdapter_LoaiPhuCap = [
        { id: '00', text: 'Chưa xác định' },
        { id: '01', text: 'Phụ cấp công vụ' },
        { id: '02', text: 'Phụ cấp lưu động' },
        { id: '03', text: 'Phụ cấp kiêm nhiệm' },
        { id: '04', text: 'Phụ cấp độc hại, nguy hiểm' },
        { id: '05', text: 'Phụ cấp đặc biệt' },
        { id: '06', text: 'Phụ cấp khu vực' },
        { id: '07', text: 'Phụ cấp thâm niên vượt khung' },
        { id: '08', text: 'Phụ cấp chức vụ lãnh đạo' },
        { id: '09', text: 'Phụ cấp thu hút' },
        { id: '10', text: 'Phụ cấp ưu đãi theo nghề' },
        { id: '11', text: 'Phụ cấp ưu đãi đối với nhà giáo' },
        { id: '12', text: 'Phụ cấp trách nhiệm' },
        { id: '13', text: 'Phụ cấp thâm niên nhà giáo' },
        { id: '14', text: 'Phụ cấp kiêm nhiệm chức danh (xã)' },
        { id: '15', text: 'Phụ cấp theo loại xã' },
        { id: '16', text: 'Phụ cấp thâm niên nghề' },
        { id: '17', text: 'Phụ cấp khác (Hệ số)' },
        { id: '18', text: 'Phụ cấp công tác Đảng' },
        { id: '19', text: 'Phụ cấp chức vụ' },
        { id: '20', text: 'Phụ cấp khác (Tỷ lệ %)' },
        { id: '21', text: 'Phụ cấp khác (Mức tiền)' },
        { id: '22', text: 'Phụ cấp lâu năm' }
    ];

    const SelectAdapter_LoaiNhaDat = [
        { id: '1', text: 'Nhà được cấp' },
        { id: '2', text: 'Nhà được cho' },
        { id: '3', text: 'Nhà được thuê' },
        { id: '4', text: 'Nhà thừa kế' },
        { id: '5', text: 'Nhà tự mua' },
        { id: '6', text: 'Nhà tự xây' },
        { id: '7', text: 'Đất được cấp' },
        { id: '8', text: 'Đất được cho' },
        { id: '9', text: 'Đất thừa kế' },
        { id: '10', text: 'Đất tự mua' },
        { id: '99', text: 'Khác' },
        { id: '00', text: 'Không có' }
    ];

    return { SelectAdapter_GioiTinh, SelectAdapter_DanToc, SelectAdapter_TonGiao, SelectAdapter_TrinhDoPhoThong, SelectAdapter_HocVi, SelectAdapter_DanhHieu, SelectAdapter_HocHam, SelectAdapter_ChucVu, SelectAdapter_ChucVuDang, SelectAdapter_BacLuong, SelectAdapter_NgachLuong, SelectAdapter_CoSoDaoTao, SelectAdapter_ChuyenNganhChuyenMon, SelectAdapter_HinhThucDaoTao, SelectAdapter_LoaiVanBang_ChinhTri, SelectAdapter_LoaiNgoaiNgu, SelectAdapter_XepLoaiChuyenMon, SelectAdapter_HinhThucKhenThuong, SelectAdapter_HinhThucKyLuat, SelectAdapter_QuanHeGiaDinh, SelectAdapter_LoaiPhuCap, SelectAdapter_LoaiNhaDat };
};